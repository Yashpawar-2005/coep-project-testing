import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Create_Join_room,Login,Signup } from './pages/export';
// import { useRecoilState } from 'recoil';
// import { userState } from './services/atom.js';
import { useUserStore } from './services/atom.js';

const Routess = () => {
    const{user}=useUserStore()
    const authuser = user !== null;
  return (
    // <Router>
          <Routes>
            <Route path='/login' element={authuser?<Create_Join_room/>:<Login/>}/>
            <Route path='/room' element={!authuser?<Login/>:<Create_Join_room/>}/>
            <Route path='/signup' element={authuser?<Create_Join_room/>:<Signup/>}/>
          {/* <Route path="/" element={<Home />} /> */}
          {/* <Route path="/about" element={<About />} /> */}
        </Routes>
    // </R outer>
  )
}

export default Routess