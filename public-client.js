/* Football Career Hub — free public site + private editor.
   Firebase WEB config is public configuration (never paste private service account secrets).
   Shared data only becomes editable after verified owner authentication AND Firestore rules check.
*/
const $=sel=>document.querySelector(sel);
const gate=$('#auth-gate'),appEl=$('#app');
const config=window.FCH_FIREBASE_CONFIG||null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const html=(title,body)=>{gate.hidden=false;gate.innerHTML=`<div class="setup-shell"><div class="setup-mark">⚽</div><h1>${title}</h1>${body}</div>`};
function normalize(state){return state&&Array.isArray(state.careers)?state:{version:1,careers:[],activeId:null,updatedAt:new Date().toISOString()}}
function showSetup(){html('Football Career Hub',`<p>青いフットボール管理サイトの準備ができています。</p><p>公開用データの接続はまだ完了していません。接続後は、同じURLで誰でも閲覧でき、管理者だけが編集できます。</p><div class="setup-info">この画面では課金やログインは求めません。公開を完成させるには、管理者が無料のFirebase設定を一度だけ登録する必要があります。</div><button id="try-demo" class="setup-primary">操作画面を試す（端末内のデモ）</button><p class="tiny-note">デモで登録したデータは他の端末へ共有されません。</p>`);
 $('#try-demo').onclick=()=>{gate.hidden=true;appEl.hidden=false;window.CareerCloud={uid:'unconnected-preview',email:'',isAdmin:true,status:'端末内デモ（同期なし）',initialState:null,shouldUseLocalCache:false,markPending(){},queue(){},watch(){},getTransferURL(){return location.href},async reloadServer(){},async logout(){location.reload()}};import('./app.js')};}
if(!config||!config.apiKey||!config.projectId||!config.appId||!config.authDomain){showSetup();}
else init();
async function init(){
 html('Football Career Hub','<p>公開されているキャリア記録を読み込んでいます…</p>');
 try{
  const v='12.19.0';
  const [{initializeApp},{getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,sendEmailVerification,sendPasswordResetEmail,signOut,reload,setPersistence,browserLocalPersistence},{getFirestore,doc,collection,getDoc,getDocs,onSnapshot,runTransaction,serverTimestamp}]=await Promise.all([
   import(`https://www.gstatic.com/firebasejs/${v}/firebase-app.js`),
   import(`https://www.gstatic.com/firebasejs/${v}/firebase-auth.js`),
   import(`https://www.gstatic.com/firebasejs/${v}/firebase-firestore.js`)]);
  const fa=initializeApp(config),auth=getAuth(fa),db=getFirestore(fa);auth.languageCode='ja';
  try{await setPersistence(auth,browserLocalPersistence)}catch(e){}
  const core={auth,db,doc,collection,getDoc,getDocs,onSnapshot,runTransaction,serverTimestamp,signOut,reload,
   signIn:(email,pass)=>signInWithEmailAndPassword(auth,email,pass),create:(email,pass)=>createUserWithEmailAndPassword(auth,email,pass),
   reset:(email)=>sendPasswordResetEmail(auth,email),verify:(user)=>sendEmailVerification(user)};
  let initialized=false,bridge,previousAdmin=null;
  async function loadForUser(user){
   const isOwner=Boolean(user&&user.emailVerified&&user.email&&user.email.toLowerCase()===String(config.ownerEmail||'').toLowerCase());
   if(initialized&&previousAdmin!==isOwner){location.reload();return}
   previousAdmin=isOwner;
   if(bridge?.unsub)bridge.unsub();
   bridge=new PublicBridge(core,isOwner,user);window.CareerCloud=bridge;
   await bridge.initialize();
   gate.hidden=true;appEl.hidden=false;document.documentElement.classList.toggle('read-only',!isOwner);
   if(!initialized){initialized=true;await import('./app.js')}
   else document.dispatchEvent(new CustomEvent('careercloud:remote-update',{detail:bridge.initialState||normalize(null)}));
   bridge.watch();
  }
  onAuthStateChanged(auth,user=>loadForUser(user).catch(e=>{console.error(e);html('公開情報を読み込めません',`<p>通信またはデータベースの設定をご確認ください。</p><p class="tiny-note">${esc(e.message)}</p><button id="retry" class="setup-primary">再読み込み</button>`);$('#retry').onclick=()=>location.reload()}));
  window.FCHAuth={
   async open(){
    html('管理者ログイン',`<p>管理者だけが試合や選手を編集できます。閲覧にはログイン不要です。</p><form id="login-form"><label>メールアドレス<input name="email" type="email" required autocomplete="email"></label><label>パスワード<input name="password" type="password" required minlength="6" autocomplete="current-password"></label><p class="login-error" id="login-error" aria-live="polite"></p><button type="submit" class="setup-primary">ログイン</button></form><div class="setup-actions"><button id="register" class="setup-link">初めての登録</button><button id="reset" class="setup-link">パスワード再設定</button><button id="go-back" class="setup-link">閲覧に戻る</button></div>`);
    $('#go-back').onclick=()=>{gate.hidden=true};
    $('#login-form').onsubmit=async e=>{e.preventDefault();const f=e.target,btn=f.querySelector('button[type=submit]');btn.disabled=true;try{await core.signIn(f.elements.email.value.trim(),f.elements.password.value)}catch(err){$('#login-error').textContent=err.code==='auth/invalid-credential'?'メールアドレスかパスワードが違います。':(err.message||'ログインできませんでした');btn.disabled=false}};
    $('#register').onclick=()=>this.openRegister();
    $('#reset').onclick=async()=>{const mail=$('#login-form').elements.email.value.trim();if(!mail){$('#login-error').textContent='メールアドレスを入力してください。';return}try{await core.reset(mail);$('#login-error').textContent='再設定メールを送信しました。'}catch(e){$('#login-error').textContent=e.message}};
   },
   async openRegister(){html('管理者アカウントを作成',`<p>管理用のメールアドレスで登録し、届いたメールで本人確認してください。</p><form id="register-form"><label>メールアドレス<input name="email" type="email" required autocomplete="email"></label><label>パスワード（6文字以上）<input name="password" type="password" required minlength="6" autocomplete="new-password"></label><p id="register-error" class="login-error"></p><button class="setup-primary">登録して確認メールを送信</button></form><button id="go-back" class="setup-link">閲覧に戻る</button>`);$('#go-back').onclick=()=>gate.hidden=true;$('#register-form').onsubmit=async e=>{e.preventDefault();const f=e.target;try{const r=await core.create(f.elements.email.value.trim(),f.elements.password.value);await core.verify(r.user);html('メールを確認してください',`<p>確認メール内のリンクを開いてから、下のボタンを押してください。</p><button class="setup-primary" id="verified">確認が終わりました</button><button id="resend" class="setup-link">再送信</button>`);$('#verified').onclick=async()=>{await core.reload(r.user);if(r.user.emailVerified)location.reload();else alert('まだメール確認が完了していません。')};$('#resend').onclick=async()=>{await core.verify(r.user);alert('再送信しました')}}catch(e){$('#register-error').textContent=e.message}}},
   async logout(){await core.signOut(auth);location.reload()}
  };
 }catch(e){console.error(e);html('接続に失敗しました',`<p>クラウド接続を確認してください。</p><p class="tiny-note">${esc(e.message||'不明なエラー')}</p>`)}
}
class PublicBridge{
 constructor(f,isAdmin,user){this.f=f;this.isAdmin=isAdmin;this.uid='shared';this.email=user?.email||'';this.initialState=null;this.cachedCareers=new Map();this.cachedImages=new Map();this.status=isAdmin?'管理者モード・接続中':'公開閲覧モード';this.revision=0;this.changeSeq=0;this.syncedSeq=0;this.latest=null;this.sending=false;this.conflict=false;this.timer=null;this.shouldUseLocalCache=false;this.unsub=null;this.pendingKey='fch-public-pending';this.onlineReady=true}
 metadata(){return this.f.doc(this.f.db,'published','main')}
 doc(kind,id){return this.f.doc(this.f.db,'published','main',kind,id)}
 split(state){const careers=new Map(),images=new Map();const photo=(key,value)=>{if(typeof value==='string'&&value.startsWith('data:image/')){if(value.length>700000)throw Error('この写真のサイズが大きすぎます。もう少し小さな写真を使ってください。');images.set(key,value)}return ''};for(const c of state.careers||[]){const x=JSON.parse(JSON.stringify(c));x.crest=photo(c.id+'|crest',x.crest);x.cover=photo(c.id+'|cover',x.cover);for(const p of x.players||[])p.photo=photo(c.id+'|p|'+p.id,p.photo);for(const m of x.matches||[])m.image=photo(c.id+'|m|'+m.id,m.image);for(const p of x.posts||[])p.image=photo(c.id+'|post|'+p.id,p.image);const data=JSON.stringify(x);if(data.length>700000)throw Error('キャリアの記録が大きすぎます。バックアップ後にデータを分割してください。');careers.set(c.id,data)}return {careers,images}}
 async loadRemote(){const {getDoc,getDocs,collection}=this.f;const snap=await getDoc(this.metadata());if(!snap.exists()){this.revision=0;this.cachedCareers=new Map();this.cachedImages=new Map();return normalize(null)}const meta=snap.data();this.revision=Number(meta.revision)||0;const ids=Array.isArray(meta.careerIds)?meta.careerIds:[];const [cs,is]=await Promise.all([Promise.all(ids.map(id=>getDoc(this.doc('careers',id)))),getDocs(collection(this.f.db,'published','main','images'))]);const images=new Map();is.forEach(s=>{if(typeof s.data().data==='string')images.set(s.id,s.data().data)});this.cachedImages=images;const careers=[];this.cachedCareers=new Map();for(let i=0;i<ids.length;i++){const payload=cs[i].data()?.payload;if(!payload)continue;try{const c=JSON.parse(payload);this.cachedCareers.set(ids[i],payload);c.crest=images.get(c.id+'|crest')||'';c.cover=images.get(c.id+'|cover')||'';for(const p of c.players||[])p.photo=images.get(c.id+'|p|'+p.id)||'';for(const m of c.matches||[])m.image=images.get(c.id+'|m|'+m.id)||'';for(const p of c.posts||[])p.image=images.get(c.id+'|post|'+p.id)||'';careers.push(c)}catch(e){console.warn('Bad career record',e)}}return normalize({version:1,careers,activeId:meta.activeId||careers[0]?.id||null,updatedAt:meta.updatedAtClient||''})}
 async initialize(){this.initialState=await this.loadRemote();this.status=this.isAdmin?'クラウド同期済み':'閲覧中';if(this.isAdmin){try{const local=JSON.parse(localStorage.getItem(this.pendingKey)||'null');if(local){this.shouldUseLocalCache=true;if(local.revision!==this.revision){this.conflict=true;this.status='他端末と競合・バックアップ推奨'}}}catch(e){}}}
 notify(msg){this.status=msg;document.dispatchEvent(new CustomEvent('careercloud:status',{detail:msg}))}
 markPending(){if(!this.isAdmin)return;localStorage.setItem(this.pendingKey,JSON.stringify({revision:this.revision,at:Date.now()}))}
 queue(state){if(!this.isAdmin)return;this.markPending();this.latest=JSON.parse(JSON.stringify(state));this.changeSeq++;if(this.conflict){this.notify('他端末との変更競合が発生しました');return}this.notify('クラウド保存待ち');clearTimeout(this.timer);this.timer=setTimeout(()=>this.sync(),1200)}
 async sync(){if(!this.isAdmin||this.sending||this.conflict||!this.latest)return;const seq=this.changeSeq,state=JSON.parse(JSON.stringify(this.latest));this.sending=true;this.notify('クラウドへ保存中…');try{const {careers,images}=this.split(state),changes=[],removals=[];for(const [id,data] of careers)if(this.cachedCareers.get(id)!==data)changes.push(['careers',id,data]);for(const [id,data] of images)if(this.cachedImages.get(id)!==data)changes.push(['images',id,data]);for(const id of this.cachedCareers.keys())if(!careers.has(id))removals.push(['careers',id]);for(const id of this.cachedImages.keys())if(!images.has(id))removals.push(['images',id]);if(changes.length+removals.length+1>400)throw Error('一度に保存する項目が多すぎます');const expected=this.revision;await this.f.runTransaction(this.f.db,async tx=>{const snap=await tx.get(this.metadata());const rev=snap.exists()?(Number(snap.data().revision)||0):0;if(rev!==expected)throw Error('CONFLICT');for(const [kind,id,data] of changes)tx.set(this.doc(kind,id),kind==='careers'?{payload:data}:{data});for(const [kind,id] of removals)tx.delete(this.doc(kind,id));tx.set(this.metadata(),{version:1,revision:rev+1,careerIds:[...careers.keys()],activeId:state.activeId||null,updatedAtClient:state.updatedAt||new Date().toISOString(),serverUpdatedAt:this.f.serverTimestamp()})});this.revision=expected+1;this.cachedCareers=careers;this.cachedImages=images;this.syncedSeq=seq;this.onlineReady=true;if(seq===this.changeSeq)localStorage.removeItem(this.pendingKey);else this.markPending();this.notify('クラウド同期済み')}catch(e){console.error('Cloud saving failed:',e);if(String(e.message).includes('CONFLICT')){this.conflict=true;this.notify('別端末との編集が競合しています')}else{this.onlineReady=false;this.notify('クラウド保存失敗・バックアップ推奨')}}finally{this.sending=false;if(this.changeSeq>seq&&!this.conflict&&this.onlineReady){clearTimeout(this.timer);this.timer=setTimeout(()=>this.sync(),800)}}}
 watch(){this.unsub=this.f.onSnapshot(this.metadata(),async snap=>{if(!snap.exists()||snap.metadata.hasPendingWrites||this.sending)return;const next=Number(snap.data().revision)||0;if(next<=this.revision)return;if(this.isAdmin&&this.changeSeq>this.syncedSeq){this.conflict=true;this.notify('別端末との編集が競合しています');return}try{const data=await this.loadRemote();document.dispatchEvent(new CustomEvent('careercloud:remote-update',{detail:data}));this.notify(this.isAdmin?'クラウド更新を取得':'最新情報に更新')}catch(e){this.notify('更新の読み込みに失敗しました')}},e=>{console.error(e);this.notify('接続が切れています')})}
 async reloadServer(){const data=await this.loadRemote();this.conflict=false;this.changeSeq=this.syncedSeq;this.latest=null;localStorage.removeItem(this.pendingKey);document.dispatchEvent(new CustomEvent('careercloud:remote-update',{detail:data}));this.notify('最新情報を取得しました')}
 getTransferURL(){return location.href.split('?')[0]}
 async logout(){await window.FCHAuth?.logout()}
}
