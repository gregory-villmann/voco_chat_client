import React, { useRef, useState } from 'react';
import './App.css';
import voco_logo from './voco.svg';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({

})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {

    const [user] = useAuthState(auth);

    return (
        <main className='App-background'>
            <nav className='navbar navbar-expand-lg bg-transparent flex-box'>
                <div className='nav-items'>
                    <div>
                        <a href="#"><img src={voco_logo} alt='voco_logo' className='voco-logo'/></a>
                    </div>

                    <div>
                        {user ? <SignOut/>:<SignIn/>}
                    </div>
                </div>
            </nav>

            <section className='middleton'>
                {user && <ChatRoom/>}
            </section>

        </main>
    );
}

function SignIn() {

    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    }

    return (
        <>
            <button className="btn btn-dark m-4" onClick={signInWithGoogle}>Sisene Google kontoga</button>
        </>
    )

}

function SignOut() {
    return auth.currentUser && (
        <button className="btn btn-dark m-4" onClick={() => auth.signOut()}>Logi välja</button>
    )
}


function ChatRoom() {
    const dummy = useRef();
    const messagesRef = firestore.collection('messages');
    const query = messagesRef.orderBy('createdAt').limit(25000);

    const [messages] = useCollectionData(query, { idField: 'id' });

    const [formValue, setFormValue] = useState('');


    const sendMessage = async (e) => {
        e.preventDefault();

        const { uid, photoURL } = auth.currentUser;

        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL
        })

        setFormValue('');
        dummy.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('msg-box').value = '';

    }

    return (<div className='chatbox'>
        <div className='chat_messages_area'>

            {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

            <div  ref={dummy}/>

        </div>

        <form onSubmit={sendMessage} className='space-between'>

            <input id='msg-box' value={formValue} className='form-control messageField' maxLength='200' onChange={(e) => setFormValue(e.target.value)} placeholder="" />

            <button className='btn btn-primary' type="submit" disabled={!formValue}><i className="fas fa-paper-plane"/></button>

        </form>
    </div>)
}


function ChatMessage(props) {
    const { text, uid, photoURL } = props.message;

    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

    return (<>
        <div className={`message ${messageClass}`}>
            <img alt='icon' src={photoURL || 'https://www.shareicon.net/data/512x512/2016/08/18/815412_people_512x512.png'} className='user-icon' />
            <p className='message-text test'>{text}</p>
        </div>
    </>)
}


export default App;