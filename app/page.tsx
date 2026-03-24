"use client";

import { useState, useEffect } from "react";

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [previous, setPrevious] = useState("");
  const [operator, setOperator] = useState("");
  const [waitingForSecondNumber, setWaitingForSecondNumber] = useState(false);
  const [secretResult, setSecretResult] = useState<number | string>("");
  const [showModal, setShowModal] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const handleNumber = (num: string) => {
    if (waitingForSecondNumber) {
      setDisplay(num);
      setWaitingForSecondNumber(false);
    } else {
      setDisplay((prev) => (prev === "0" ? num : prev + num));
    }
  };

  const handleOperator = (op: string) => {
    if (operator && !waitingForSecondNumber) {
      calculateResult();
    }
    setPrevious(display);
    setOperator(op);
    setWaitingForSecondNumber(true);
  };

  const handleEquals = () => {
    if (!operator) return;
    calculateResult();
  };

  const calculateResult = () => {
    if (!operator || !previous) return;

    let result: number | string = "Error";
    const prevNum = parseFloat(previous);
    const currNum = parseFloat(display);

    switch (operator) {
      case "+":
        result = prevNum + currNum;
        break;
      case "-":
        result = prevNum - currNum;
        break;
      case "*":
        result = prevNum * currNum;
        break;
      case "/":
        result = currNum !== 0 ? prevNum / currNum : "Error";
        break;
      case "%":
        result = prevNum % currNum;
        break;
    }

    setSecretResult(result);
    setShowModal(true);
  };

  // ================== CONFETTI FUNCTION ==================
  const triggerConfetti = () => {
    const emojis = ["🎉", "✨", "💸", "🔥", "🚀", "⭐", "🪄"];

    for (let i = 0; i < 180; i++) {
      setTimeout(() => {
        const confetti = document.createElement("div");

        // Styling
        confetti.style.position = "fixed";
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.top = `-40px`;
        confetti.style.fontSize = `${Math.random() * 16 + 24}px`;
        confetti.style.zIndex = "9999";
        confetti.style.pointerEvents = "none";
        confetti.style.opacity = `${Math.random() * 0.5 + 0.75}`;
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.textContent =
          emojis[Math.floor(Math.random() * emojis.length)];

        document.body.appendChild(confetti);

        // Durasi lebih lambat dan natural (4 - 7.5 detik)
        const duration = Math.random() * 3500 + 4000;
        const drift = (Math.random() - 0.5) * 220; // gerakan miring

        const animation = confetti.animate(
          [
            {
              transform: `translateY(0) translateX(0) rotate(0deg)`,
              opacity: 1,
            },
            {
              transform: `translateY(${window.innerHeight + 200}px) translateX(${drift}px) rotate(${Math.random() * 800 - 400}deg)`,
              opacity: 0,
            },
          ],
          {
            duration: duration,
            easing: "cubic-bezier(0.25, 0.1, 0.3, 1)",
          },
        );

        // Hapus elemen dengan aman setelah animasi selesai
        animation.onfinish = () => {
          if (confetti.parentNode) {
            confetti.parentNode.removeChild(confetti);
          }
        };
      }, i * 7); // stagger lebih lebar → confetti turun lebih perlahan
    }
  };
  // =======================================================

  const unlockAnswer = () => {
    setDisplay(secretResult.toString());
    setShowModal(false);

    const entry = `${previous} ${operator} ${display} = ${secretResult}`;
    setHistory((prev) => [entry, ...prev].slice(0, 8));

    // Trigger confetti saat berhasil bayar
    triggerConfetti();

    // Reset state
    setPrevious("");
    setOperator("");
    setWaitingForSecondNumber(false);
  };

  const clear = () => {
    setDisplay("0");
    setPrevious("");
    setOperator("");
    setWaitingForSecondNumber(false);
  };

  const backspace = () => {
    if (waitingForSecondNumber) return;
    setDisplay((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)));
  };

  // Keyboard Support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (/[0-9.]/.test(e.key)) handleNumber(e.key);
      if (["+", "-", "*", "/", "%"].includes(e.key)) {
        handleOperator(e.key === "*" ? "*" : e.key);
      }
      if (e.key === "Enter" || e.key === "=") handleEquals();
      if (e.key === "Backspace") backspace();
      if (e.key.toLowerCase() === "c" || e.key === "Escape") clear();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [display, previous, operator, waitingForSecondNumber]);

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Calculator</h1>
        </div>
        <div style={{ fontSize: "12px", color: "#555" }}>v1.0</div>
      </div>

      <div className="calculator">
        <div className="display">
          <div className="display-text">{display}</div>
        </div>

        <div className="buttons">
          <button className="btn btn-clear" onClick={clear}>
            AC
          </button>
          <button className="btn btn-clear" onClick={backspace}>
            ⌫
          </button>
          <button
            className="btn btn-operator"
            onClick={() => handleOperator("%")}
          >
            %
          </button>
          <button
            className="btn btn-operator"
            onClick={() => handleOperator("/")}
          >
            ÷
          </button>

          {[7, 8, 9].map((n) => (
            <button
              key={n}
              className="btn btn-number"
              onClick={() => handleNumber(n.toString())}
            >
              {n}
            </button>
          ))}
          <button
            className="btn btn-operator"
            onClick={() => handleOperator("*")}
          >
            ×
          </button>

          {[4, 5, 6].map((n) => (
            <button
              key={n}
              className="btn btn-number"
              onClick={() => handleNumber(n.toString())}
            >
              {n}
            </button>
          ))}
          <button
            className="btn btn-operator"
            onClick={() => handleOperator("-")}
          >
            −
          </button>

          {[1, 2, 3].map((n) => (
            <button
              key={n}
              className="btn btn-number"
              onClick={() => handleNumber(n.toString())}
            >
              {n}
            </button>
          ))}
          <button
            className="btn btn-operator"
            onClick={() => handleOperator("+")}
          >
            +
          </button>

          <button
            className="btn btn-number"
            style={{ gridColumn: "span 2" }}
            onClick={() => handleNumber("0")}
          >
            0
          </button>
          <button className="btn btn-number" onClick={() => handleNumber(".")}>
            .
          </button>
          <button className="btn btn-equal" onClick={handleEquals}>
            =
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <div className="history">
          <h3>Riwayat Perhitungan</h3>
          {history.map((item, i) => (
            <div key={i} className="history-item">
              {item}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>🔐</div>
            <h2>Hasil Perhitungan Terkunci</h2>
            <p>
              Untuk melihat jawaban lengkap,
              <br />
              silakan lakukan pembayaran
            </p>

            <div className="expression">
              {previous} {operator} {display}
            </div>

            <button className="pay-btn" onClick={unlockAnswer}>
              Bayar Rp5.000 untuk Melihat Jawaban
            </button>

            <button className="cancel-btn" onClick={() => setShowModal(false)}>
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
