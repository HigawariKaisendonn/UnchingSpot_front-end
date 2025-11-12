"use client";

import Link from "next/link";
import "@/styles/pages/welcome.scss";

export default function WelcomePage() {
  return (
    <main className="welcome-page">
      <div className="welcome-container">
        <h1 className="welcome-title">うんちんぐすぽっと</h1>
        <p className="welcome-catch">ふんした場所を記録してマーキングしよう！</p>

        <section className="welcome-description">
          <p>
            このアプリでは、訪れた場所を記録し、自分だけの「スポットマップ」を作成できます。
            楽しく、かんたんに日々の記録を残していきましょう！
          </p>
        </section>

        <Link href="/home" className="welcome-button">
          はじめる
        </Link>
      </div>
    </main>
  );
}