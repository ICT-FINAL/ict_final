import React, { useEffect, useRef, useState } from 'react';

const DailyCheck = () => {
  const canvasRef = useRef(null);
  const needleRef = useRef(null);
  const [rotation, setRotation] = useState(0);

  const product = [
    "1000원 쿠폰",
    "꽝",
    "100원 쿠폰",
    "꽝",
    "100원 쿠폰",
    "꽝",
    "꽝",
    "꽝",
    "5000원 쿠폰",
  ];

  const colors = [
    "#dc0936",
    "#e6471d",
    "#f7a416",
    "#efe61f ",
    "#60b236",
    "#209b6c",
    "#169ed8",
    "#0d66e4",
    "#87207b",
    "#be107f",
    "#e7167b",
  ];

  const newMake = () => {
    const $c = canvasRef.current;
    const ctx = $c.getContext("2d");
    const [cw, ch] = [$c.width / 2, $c.height / 2];
    const arc = (2 * Math.PI) / product.length;

    for (let i = 0; i < product.length; i++) {
      ctx.beginPath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.moveTo(cw, ch);
      ctx.arc(cw, ch, cw - 2, arc * i - Math.PI / 2, arc * (i + 1) - Math.PI / 2);
      ctx.fill();
      ctx.closePath();
    }

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;

    ctx.fillStyle = "#000";
    ctx.font = "1.8rem Pretendard";
    ctx.textAlign = "center";

    for (let i = 0; i < product.length; i++) {
      const angle = arc * i + arc / 2 - Math.PI / 2;

      ctx.save();

      ctx.translate(
        cw + Math.cos(angle) * (cw - 50),
        ch + Math.sin(angle) * (ch - 50)
      );

      ctx.rotate(angle + Math.PI / 2);

      product[i].split(" ").forEach((text, j) => {
        ctx.fillText(text, 0, 30 * j);
      });

      ctx.restore();
    }

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(cw, ch);
    ctx.arc(cw, ch, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  };

  const rotate = () => {
    const $c = canvasRef.current;
    $c.style.transform = `rotate(${rotation}deg)`;
    $c.style.transition = `initial`;

    setTimeout(() => {
      const ran = Math.floor(Math.random() * product.length);
      const arcDegrees = 360 / product.length;
      const targetRotation = 3600 - (ran * arcDegrees) - (arcDegrees / 2); // Center the winning item

      $c.style.transform = `rotate(${targetRotation}deg)`;
      $c.style.transition = `transform 2s cubic-bezier(0.23, 1, 0.32, 1)`; // Add easing

      setTimeout(
        () => alert(`오늘의 야식은?! ${product[ran]} 어떠신가요?`),
        2000
      );
      setRotation(targetRotation % 360); // Update current rotation
    }, 1);
  };

  useEffect(() => {
    newMake();
  }, []);

  return (
    <div style={containerStyle}>
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        style={canvasStyle}
      ></canvas>
      <div ref={needleRef} style={needleStyle}></div>
      <button onClick={rotate}>룰렛 돌리기</button>
    </div>
  );
};

const containerStyle = {
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  position: 'relative',
  paddingTop: '200px',
};

const canvasStyle = {
  transition: 'transform 2s',
  pointerEvents: 'none',
};

const needleStyle = {
  width: 0,
  height: 0,
  borderLeft: '10px solid transparent',
  borderRight: '10px solid transparent',
  borderTop: '30px solid red',
  position: 'absolute',
  top: '170px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1,
};

export default DailyCheck;