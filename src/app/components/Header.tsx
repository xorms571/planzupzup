"use client";

import React, { useState, useEffect } from "react";
import styles from "@/app/components/Header.module.scss";
import axios from "axios";
import { useRouter } from "next/navigation";

const Header: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACK_HOST}/auth`,
          { withCredentials: true }
        );

        if (response.data.result === "로그인 성공") {
          setIsLogin(true);
          setProfileMenuOpen(true);
        } else {
          setIsLogin(false);
        }
      } catch (error) {
        console.error("Failed to check login status:", error);
        setIsLogin(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACK_HOST}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      setIsLogin(false);
      setProfileMenuOpen(false);
    } catch (error) {
      console.error("Failed to logout:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  const clickCreatePlanOrMyPageButton = (location: string) => {
    if (isLogin) {
      router.push(`/${location}`);
    } else {
      router.push("/login");
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className={styles.header_wrap}>
      <a href="/" className={styles.logo}></a>
      <div
        className={`${styles.hamburger} ${isMobileMenuOpen ? styles.active : ""}`}
        onClick={toggleMobileMenu}
      >
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div
        className={`${styles.nav_area} ${isMobileMenuOpen ? styles.mobile_nav_open : ""}`}>
        <div className={styles.nav}>
          <button
            className={styles.customButton}
            onClick={() => clickCreatePlanOrMyPageButton("create")}
          >
            플랜만들기
          </button>
        </div>
        <div className={styles.nav}>
          <button
            className={styles.customButton}
            onClick={() => router.push("/search")}
          >
            플랜줍기
          </button>
        </div>

        {!isLogin ? (
          <div className={styles.nav}>
            <button
              className={styles.customButton}
              onClick={() => router.push("/login")}
            >
              로그인
            </button>
          </div>
        ) : (
          <>
            {profileMenuOpen && (
              <>
                <div className={styles.nav}>
                  <button
                    onClick={() => clickCreatePlanOrMyPageButton("my")}
                    className={styles.customButton}
                  >
                    마이페이지
                  </button>
                </div>
                <div className={styles.nav}>
                  <button
                    className={styles.customButton}
                    onClick={handleLogout}
                  >
                    로그아웃
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
      <div className={styles.blur_bg} style={{height: isMobileMenuOpen && windowWidth < 770 ? "400px" : "64px"}}/>
    </header>
  );
};

export default Header;