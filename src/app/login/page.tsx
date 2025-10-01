"use client";

import { useEffect, useState } from "react";
import style from "./Login.module.scss";

const Login = () => {

    useEffect(() => {

        document.body.style.height = '100%';
      },[]);

    return (
        <div className={style.login}>
            <div className={style.login_wrap}>
                <div className={style.top_text}>Planzupzup 카카오 로그인</div>
                <p className={style.desc}>카카오 계정으로 로그인해주세요</p>
                <button type="button" className={style.login_btn} onClick={() => window.location.href=`${process.env.NEXT_PUBLIC_BACK_HOST}/oauth2/authorization/kakao`}>카카오 로그인</button>
                <span className={style.speech_bubble}><span className="blind">3초만에 시작하기</span></span>
            </div>
        </div>
    )
}

export default Login;