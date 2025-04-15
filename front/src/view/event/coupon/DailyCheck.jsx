import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

const DailyCheck = () => {
  const canvasRef = useRef(null);
  const needleRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const token = useSelector((state) => state.auth.user.token);
  const serverIP = useSelector((state) => state.serverIP.ip);

  const product = [
    "1000원 쿠폰", "꽝", "100원 쿠폰", "꽝", "100원 쿠폰", "꽝", "꽝", "꽝", "5000원 쿠폰",
  ];

  const colors = [
    "#dc0936", "#e6471d", "#f7a416", "#efe61f", "#60b236", "#209b6c", "#169ed8", "#0d66e4", "#87207b",
  ];

  const drawRouletteWheel = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const [cw, ch] = [canvas.width / 2, canvas.height / 2];
    const arc = (2 * Math.PI) / product.length;

    for (let i = 0; i < product.length; i++) {
      ctx.beginPath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.moveTo(cw, ch);
      ctx.arc(cw, ch, cw - 2, arc * i - Math.PI / 2, arc * (i + 1) - Math.PI / 2);
      ctx.fill();
      ctx.closePath();
    }

    ctx.fillStyle = "#000";
    ctx.font = "bold 18px Pretendard";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < product.length; i++) {
      const angle = arc * i + arc / 2 - Math.PI / 2;
      ctx.save();
      ctx.translate(cw + Math.cos(angle) * (cw - 60), ch + Math.sin(angle) * (ch - 60));
      ctx.rotate(angle + Math.PI / 2);
      ctx.fillText(product[i], 0, 0);
      ctx.restore();
    }

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(cw, ch, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  };

  const rotateWheel = async () => {
    if (isSpinning) return;
    setIsSpinning(true);

    console.log("Initiating spin - Server IP:", serverIP, "Token:", token);

    try {
      const canSpin = await checkCanSpin();
      if (!canSpin) {
        alert("오늘은 이미 돌리셨습니다.");
        setIsSpinning(false);
        return;
      }

      const result = await performSpin();
      const index = product.indexOf(result);
      if (index === -1) {
        alert("알 수 없는 결과입니다.");
        setIsSpinning(false);
        return;
      }

      const arcDeg = 360 / product.length;
      const target = 3600 + index * arcDeg + arcDeg / 2;
      const canvas = canvasRef.current;
      canvas.style.transform = `rotate(${target}deg)`;
      canvas.style.transition = `transform 3s ease-out`;

      setTimeout(() => {
        alert(`결과: ${result}\n보상: 100포인트가 지급되었습니다.`);
        setRotation(target % 360);
        setIsSpinning(false);
      }, 3000);
    } catch (err) {
      console.error("Spin error:", err.message);
      alert(`오류: ${err.message || "서버 오류 또는 인증 실패입니다."}`);
      setIsSpinning(false);
    }
  };

  const checkCanSpin = async () => {
    const checkRes = await fetch(`${serverIP}/api/roulette/check`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Cache-Control": "no-cache" },
    });

    if (!checkRes.ok) {
      throw new Error(`Check API failed with status: ${checkRes.status}`);
    }

    return await checkRes.json();
  };

  const performSpin = async () => {
    const spinRes = await fetch(`${serverIP}/api/roulette/spin`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });

    if (!spinRes.ok) {
      const errorText = await spinRes.text();
      throw new Error(`Spin API failed with status: ${spinRes.status} - ${errorText}`);
    }

    return await spinRes.text();
  };

  useEffect(() => {
    drawRouletteWheel();
  }, []);

  return (
    <div style={containerStyle}>
      <canvas ref={canvasRef} width={500} height={500} style={canvasStyle}></canvas>
      <div ref={needleRef} style={needleStyle}></div>
      <button onClick={rotateWheel} style={buttonStyle} disabled={isSpinning}>
        {isSpinning ? "회전 중..." : "룰렛 돌리기"}
      </button>
    </div>
  );
};

const containerStyle = { display: 'flex', alignItems: 'center', flexDirection: 'column', position: 'relative', paddingTop: '200px' };
const canvasStyle = { transition: 'transform 3s ease-out', pointerEvents: 'none' };
const needleStyle = { width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '30px solid red', position: 'absolute', top: '170px', left: '50%', transform: 'translateX(-50%)', zIndex: 1 };
const buttonStyle = { marginTop: '20px', padding: '10px 20px', fontSize: '18px', backgroundColor: '#f57c00', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' };

export default DailyCheck;
