import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import "../../../css/view/roulette.css";

const DailyCheck = () => {
  const canvasRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationState, setRotationState] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [prize, setPrize] = useState("");
  const [result, setResult] = useState(null);

  const token = useSelector((state) => state.auth.user.token);
  const serverIP = useSelector((state) => state.serverIP.ip);

  const product = [
    "10% COUPON",
    "1,000P",
    "20% COUPON",
    "500P",
    "꽝",
    "2000P",
    "30% COUPON",
    "1500P",
  ];

  const colors = [
    "#ffcc00",
    "#ff6666",
    "#66ccff",
    "#99cc33",
    "#cccccc",
    "#ff9999",
    "#9966cc",
    "#cccccc",
  ];

  const drawRouletteWheel = (angle = 0) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const [cw, ch] = [canvas.width / 2, canvas.height / 2];
    const arc = (2 * Math.PI) / product.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(cw, ch);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.translate(-cw, -ch);

    for (let i = 0; i < product.length; i++) {
      ctx.beginPath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.moveTo(cw, ch);
      ctx.arc(
        cw,
        ch,
        cw - 2,
        arc * i - Math.PI / 2,
        arc * (i + 1) - Math.PI / 2
      );
      ctx.fill();
      ctx.closePath();
    }

    ctx.fillStyle = "#000";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < product.length; i++) {
      const angleText = arc * i + arc / 2 - Math.PI / 2;
      ctx.save();
      ctx.translate(
        cw + Math.cos(angleText) * (cw - 60),
        ch + Math.sin(angleText) * (ch - 60)
      );
      ctx.rotate(angleText + Math.PI / 2);
      ctx.fillText(product[i], 0, 0);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(cw, ch, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  };

  const rotateWheel = async () => {
    if (isSpinning) return;
    setIsSpinning(true);

    try {
      const canSpin = await checkCanSpin();
      if (!canSpin) {
        alert("오늘은 이미 돌리셨습니다.");
        setIsSpinning(false);
        return;
      }

      const result = await performSpin();
      const index = product.indexOf(result);
      if (index === -1) throw new Error("서버 결과가 product에 없습니다.");

      const arcDeg = 360 / product.length;
      const targetDeg = 360 * 5 + (360 - (index * arcDeg + arcDeg / 2));
      const duration = 3000;
      const frameRate = 1000 / 60;
      const totalFrames = duration / frameRate;
      let frame = 0;

      const animate = () => {
        frame++;
        const progress = frame / totalFrames;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentAngle = targetDeg * easeOut;

        drawRouletteWheel(currentAngle);

        if (frame < totalFrames) {
          requestAnimationFrame(animate);
        } else {
          setPrize(result);
          setShowModal(true);
          setRotationState(currentAngle % 360);
          setResult(result);
        }
      };

      animate();
    } catch (err) {
      alert("오류 발생: " + err.message);
    } finally {
      setIsSpinning(false);
    }
  };

  const checkCanSpin = async () => {
    const res = await fetch(`${serverIP}/api/roulette/check`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache",
      },
    });
    if (!res.ok) throw new Error(`Check API failed: ${res.status}`);
    return await res.json();
  };

  const performSpin = async () => {
    const res = await fetch(`${serverIP}/api/roulette/spin`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error(`Spin API failed: ${res.status}`);
    return await res.text();
  };

  useEffect(() => {
    drawRouletteWheel();
  }, []);

  return (
    <div className="roulette-background">
      <div className="roulette-card">
        <h1 className="roulette-title">🎉 매일 룰렛 이벤트!</h1>
        <p className="roulette-desc">
          하루 한 번 룰렛을 돌리고 포인트와 쿠폰을 받아가세요!
        </p>

        <div className="roulette-container">
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            className="roulette-canvas"
          />
          <div className="roulette-needle"></div>
          <button
            className="roulette-button"
            onClick={rotateWheel}
            disabled={isSpinning}
          >
            {isSpinning ? "..." : "START"}
          </button>
        </div>

        {showModal && (
          <div className="roulette-modal-overlay">
            <div className="roulette-modal">
              <h2 className="roulette-modal-title">🎊 축하합니다! 🎊</h2>
              <p className="roulette-modal-result">
                당첨 결과: <strong>{prize}</strong>
              </p>
              <p className="roulette-modal-sub">
                💰 100 포인트가 지급되었습니다.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="roulette-modal-button"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyCheck;
