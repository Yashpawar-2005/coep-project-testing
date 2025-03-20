import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { Create_Join_room,Login,Signup,New, ChatInterface, AdminContributionsPage } from './pages/export';
// import { useRecoilState } from 'recoil';
// import { userState } from './services/atom.js';
import { useUserStore } from './services/atom.js';

const Routess = () => {
    const{user}=useUserStore()
    const authuser = user !== null;
  return (
    // <Router>
          <Routes>
            <Route path='/login' element={!authuser?<Login/>:<Navigate to="/room"/>}/>
            <Route path='/room' element={authuser?<New/>:<Navigate to="/login"/>}/>
            <Route path='/signup' element={!authuser?<Signup/>:<Navigate to="/room"/>}/>
            <Route path='/room/:id' element={authuser?<ChatInterface/>:<Navigate to="/login"/>}/>
            <Route path='/teams/manage/:id' element={authuser?<AdminContributionsPage/>:<Navigate to="/login"/>}/>
          {/* <Route path="/" element={<Home />} /> */}
          {/* <Route path="/about" element={<About />} /> */}
        </Routes>
    // </R outer>
  )
}

export default Routess