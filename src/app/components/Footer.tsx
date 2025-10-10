import style from "./Footer.module.scss";

const Footer = () => {
    return (
        <footer className={style.footer_wrap}>
            <div className={style.email}>Plan zupzup 대표 김희영<br />
                Contact huiyeong9619@naver.com
            </div>
            <div  className={style.right}>Copyright Plan zupzup. All Right Reserved.</div>
        </footer>
    )   
}
/* eslint-disable */

export default Footer;