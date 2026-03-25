"use client";

import { useState, useEffect } from "react";

type Plan = {
  id: string;
  name: string;
  price: string;
  answers: number;
  operators: string[];
  lockedOperators: string[];
  badge?: string;
  color: string;
};

type PaymentMethod = {
  id: string;
  name: string;
  icon: string;
  desc: string;
};

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "Rp 5,000",
    answers: 1,
    operators: ["+", "-", "×", "÷"],
    lockedOperators: ["%", "x²", "√", "1/x"],
    color: "#60a5fa",
  },
  {
    id: "pro",
    name: "Pro",
    price: "Rp 15,000",
    answers: 3,
    operators: ["+", "-", "×", "÷", "%", "x²", "√", "1/x"],
    lockedOperators: [],
    badge: "BEST VALUE",
    color: "#f97316",
  },
];

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "gopay", name: "GoPay", icon: "💚", desc: "GoPay balance" },
  { id: "ovo", name: "OVO", icon: "💜", desc: "OVO balance" },
  { id: "dana", name: "DANA", icon: "💙", desc: "DANA balance" },
  { id: "bca", name: "BCA Virtual", icon: "🏦", desc: "BCA transfer" },
  { id: "qris", name: "QRIS", icon: "📱", desc: "Scan QR code" },
];

const PRO_OPERATORS = ["x²", "√", "1/x"];
type ModalStep = null | "lock" | "plan" | "payment" | "processing";

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [previous, setPrevious] = useState("");
  const [operator, setOperator] = useState("");
  const [waitingForSecond, setWaiting] = useState(false);
  const [secretResult, setSecret] = useState<number | string>("");
  const [modalStep, setModalStep] = useState<ModalStep>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [answersLeft, setAnswersLeft] = useState(0);

  const isPro = activePlan?.id === "pro";

  const handleNumber = (num: string) => {
    if (waitingForSecond) {
      setDisplay(num);
      setWaiting(false);
    } else setDisplay((p) => (p === "0" ? num : p + num));
  };

  const handleOperator = (op: string) => {
    if (PRO_OPERATORS.includes(op) && !isPro) {
      setModalStep("plan");
      return;
    }
    if (op === "x²") {
      const v = parseFloat(display),
        r = v * v;
      setDisplay(r.toString());
      setHistory((h) => [`${v}² = ${r}`, ...h].slice(0, 8));
      triggerConfetti();
      return;
    }
    if (op === "√") {
      const v = parseFloat(display),
        r = v >= 0 ? Math.sqrt(v) : "Error";
      setDisplay(r.toString());
      setHistory((h) => [`√${v} = ${r}`, ...h].slice(0, 8));
      triggerConfetti();
      return;
    }
    if (op === "1/x") {
      const v = parseFloat(display),
        r = v !== 0 ? 1 / v : "Error";
      setDisplay(r.toString());
      setHistory((h) => [`1/${v} = ${r}`, ...h].slice(0, 8));
      triggerConfetti();
      return;
    }
    if (operator && !waitingForSecond) calcResult(false);
    setPrevious(display);
    setOperator(op);
    setWaiting(true);
  };

  const handleEquals = () => {
    if (!operator) return;
    calcResult(true);
  };

  const calcResult = (gate: boolean) => {
    if (!operator || !previous) return;
    const p = parseFloat(previous),
      c = parseFloat(display);
    let result: number | string = "Error";
    switch (operator) {
      case "+":
        result = p + c;
        break;
      case "-":
        result = p - c;
        break;
      case "*":
        result = p * c;
        break;
      case "/":
        result = c !== 0 ? p / c : "Error";
        break;
      case "%":
        result = p % c;
        break;
    }
    if (!gate) {
      setDisplay(result.toString());
      setPrevious("");
      setOperator("");
      setWaiting(false);
      return;
    }
    if (!activePlan || answersLeft <= 0) {
      setSecret(result);
      setModalStep("lock");
      return;
    }
    reveal(result, activePlan, answersLeft);
  };

  // FIX: accept plan + left as params to avoid stale closure
  const reveal = (result: number | string, plan: Plan, left: number) => {
    setDisplay(result.toString());
    setHistory((h) =>
      [`${previous} ${operator} ${display} = ${result}`, ...h].slice(0, 8),
    );
    triggerConfetti();
    setPrevious("");
    setOperator("");
    setWaiting(false);
    const newLeft = left - 1;
    setAnswersLeft(newLeft);
    if (newLeft <= 0) setActivePlan(null);
    else setActivePlan(plan);
  };

  const choosePlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setModalStep("payment");
  };

  const choosePayment = () => {
    const plan = selectedPlan!;
    setModalStep("processing");
    setTimeout(() => {
      // Set plan state
      setActivePlan(plan);
      setAnswersLeft(plan.answers);
      setModalStep(null);

      if (secretResult !== "") {
        const pending = secretResult;
        setSecret("");
        // Use plan.answers directly — not stale state
        setTimeout(() => {
          reveal(pending, plan, plan.answers);
        }, 150);
      }
    }, 1200);
  };

  const triggerConfetti = () => {
    const emojis = ["🎉", "✨", "💸", "🔥", "🚀", "⭐", "🪄"];
    for (let i = 0; i < 160; i++) {
      setTimeout(() => {
        const el = document.createElement("div");
        Object.assign(el.style, {
          position: "fixed",
          left: `${Math.random() * 100}vw`,
          top: "-40px",
          fontSize: `${Math.random() * 16 + 22}px`,
          zIndex: "9999",
          pointerEvents: "none",
        });
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        document.body.appendChild(el);
        const anim = el.animate(
          [
            { transform: "translateY(0) rotate(0deg)", opacity: 1 },
            {
              transform: `translateY(${window.innerHeight + 200}px) translateX(${(Math.random() - 0.5) * 200}px) rotate(${Math.random() * 720}deg)`,
              opacity: 0,
            },
          ],
          {
            duration: Math.random() * 3000 + 3500,
            easing: "cubic-bezier(.25,.1,.3,1)",
          },
        );
        anim.onfinish = () => el.parentNode?.removeChild(el);
      }, i * 8);
    }
  };

  const clear = () => {
    setDisplay("0");
    setPrevious("");
    setOperator("");
    setWaiting(false);
  };
  const backspace = () => {
    if (waitingForSecond) return;
    setDisplay((p) => (p.length <= 1 ? "0" : p.slice(0, -1)));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/[0-9.]/.test(e.key)) handleNumber(e.key);
      if (["+", "-", "*", "/", "%"].includes(e.key)) handleOperator(e.key);
      if (e.key === "Enter" || e.key === "=") handleEquals();
      if (e.key === "Backspace") backspace();
      if (e.key.toLowerCase() === "c" || e.key === "Escape") {
        clear();
        setModalStep(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [display, previous, operator, waitingForSecond]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap');
        .calc-wrap { max-width:400px; margin:0 auto; padding:24px 16px; font-family:system-ui,sans-serif; }
        .calc-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; }
        .calc-header h1 { font-family:'Space Grotesk',sans-serif; font-size:28px; font-weight:700; color:#fff; letter-spacing:-0.02em; }
        .header-right { display:flex; align-items:center; gap:10px; }
        .plan-pill { font-size:11px; font-weight:600; border:1px solid; border-radius:20px; padding:3px 10px; letter-spacing:.04em; }
        .version { font-size:12px; color:#444; }

        .calc-card { background:#171717; border:1px solid #252525; border-radius:24px; padding:18px; }

        .display {
          background:#0d0d0d; border:1px solid #1e1e1e; border-radius:16px;
          padding:14px 18px; margin-bottom:16px;
          display:flex; flex-direction:column; align-items:flex-end; gap:2px;
          min-height:88px; justify-content:flex-end;
        }
        .display-sub  { font-family:'Space Grotesk',monospace; font-size:13px; color:#3a3a3a; min-height:18px; }
        .display-main { font-family:'Space Grotesk',monospace; font-size:54px; font-weight:600; color:#fff; letter-spacing:-0.03em; line-height:1; }

        /* 5-column grid for the pro-op row */
        .btn-grid {
          display:grid;
          grid-template-columns:repeat(4,1fr);
          grid-template-rows:repeat(5,58px) 58px;
          gap:9px;
        }

        .cbtn {
          border-radius:13px; font-size:19px; font-weight:500;
          display:flex; align-items:center; justify-content:center; gap:3px;
          border:none; cursor:pointer; transition:all .1s; user-select:none;
        }
        .cbtn:active { transform:scale(0.93); }
        .cbtn:hover  { filter:brightness(1.12); }
        .cbtn-fn  { background:#242426; color:#ef4444; }
        .cbtn-op  { background:#242426; color:#22d3ee; }
        .cbtn-num { background:#242426; color:#fff; }
        .cbtn-pro { background:#18181e; color:#a78bfa; border:1px solid #2e2e40; font-size:13px; font-weight:600; }
        .cbtn-locked { color:#383840; border-color:#1e1e1e; }
        .lock-ico { font-size:9px; }

        /* = button spans rows 5+6 in column 4 */
        .cbtn-eq {
          background:linear-gradient(135deg,#f97316,#eab308);
          color:#fff; font-weight:700; font-size:28px;
          box-shadow:0 0 18px rgba(249,115,22,.35);
          grid-column:4;
          grid-row:5 / 7;
        }
        /* 0 spans 2 cols in row 6 */
        .span2 { grid-column:span 2; }

        .history { margin-top:20px; background:#171717; border:1px solid #252525; border-radius:20px; padding:16px; }
        .history h3 { color:#444; font-size:12px; font-weight:600; margin-bottom:10px; text-transform:uppercase; letter-spacing:.07em; }
        .history-item {
          background:#0d0d0d; padding:11px 13px; border-radius:11px;
          margin-bottom:7px; font-family:monospace; font-size:13px;
          border-left:3px solid #f97316; color:#aaa;
        }

        .overlay {
          position:fixed; inset:0; background:rgba(0,0,0,.82);
          display:flex; align-items:center; justify-content:center;
          z-index:1000; padding:20px;
        }
        .modal-box {
          background:#111; border:1px solid #252525; border-radius:24px;
          width:100%; max-width:390px; max-height:88vh; overflow-y:auto;
          animation:popIn .28s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes popIn { from{opacity:0;transform:scale(.9) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .modal-inner { padding:30px 22px 26px; display:flex; flex-direction:column; align-items:center; }
        .modal-emoji { font-size:38px; margin-bottom:10px; }
        .modal-title { font-family:'Space Grotesk',sans-serif; font-size:21px; font-weight:700; color:#fff; margin-bottom:6px; text-align:center; }
        .modal-sub   { color:#555; font-size:14px; margin-bottom:18px; text-align:center; line-height:1.5; }

        .expression {
          background:#0a0a0a; border:1px solid #1e1e1e; border-radius:13px;
          padding:13px 18px; font-size:22px; font-family:monospace;
          margin-bottom:18px; color:#fff; width:100%; text-align:center;
        }
        .cta-btn {
          width:100%; padding:14px; background:linear-gradient(135deg,#f97316,#eab308);
          color:#fff; border:none; border-radius:13px; font-size:15px; font-weight:600;
          cursor:pointer; margin-bottom:10px; transition:all .15s;
        }
        .cta-btn:active { transform:scale(.97); }
        .ghost-btn { background:none; border:none; color:#484848; font-size:13px; cursor:pointer; padding:8px; }
        .ghost-btn:hover { color:#888; }

        /* Plan grid */
        .plan-grid { display:grid; grid-template-columns:1fr 1fr; gap:11px; width:100%; margin-bottom:14px; }
        .plan-card {
          background:#181818; border:1px solid #252525; border-radius:18px;
          padding:14px 11px; cursor:pointer; position:relative; overflow:hidden;
          transition:all .18s; display:flex; flex-direction:column;
        }
        .plan-card:hover { border-color:var(--pc); transform:translateY(-2px); }
        .plan-card:active { transform:scale(.97); }
        .plan-card-featured { border-color:rgba(249,115,22,.25); background:linear-gradient(160deg,#1c1410 0%,#181818 55%); }

        .plan-badge {
          position:absolute; top:7px; right:7px;
          background:linear-gradient(135deg,#f97316,#eab308);
          color:#fff; font-size:7px; font-weight:700; letter-spacing:.08em;
          padding:2px 6px; border-radius:20px;
        }
        .plan-name  { font-family:'Space Grotesk',sans-serif; font-size:14px; font-weight:700; color:var(--pc); margin-bottom:2px; }
        .plan-price { font-size:11px; color:#666; margin-bottom:10px; }
        .plan-ans-box {
          display:flex; align-items:baseline; gap:4px;
          background:#0d0d0d; border-radius:10px; padding:7px 9px; margin-bottom:11px;
        }
        .plan-ans-num   { font-family:'Space Grotesk',sans-serif; font-size:26px; font-weight:700; color:var(--pc); line-height:1; }
        .plan-ans-label { font-size:10px; color:#444; }
        .plan-div { height:1px; background:#1e1e1e; margin-bottom:9px; }
        .plan-ops { list-style:none; margin-bottom:12px; flex:1; }
        .plan-ops li { font-size:11px; padding:2px 0; display:flex; align-items:center; gap:4px; }
        .plan-ops li.op-available { color:#555; }
        .plan-ops li.op-locked    { color:#2a2a2a; }
        .op-chk  { font-size:11px; }
        .op-cross { font-size:10px; }
        .plan-ops code { background:#0a0a0a; border-radius:4px; padding:1px 4px; font-size:10px; }
        .op-available code { color:#999; }
        .op-locked    code { color:#2a2a2a; }
        .plan-cta-btn { width:100%; padding:9px; border-radius:10px; font-size:11px; font-weight:700; color:#fff; text-align:center; margin-top:auto; }

        /* Payment */
        .plan-tag { border:1px solid; border-radius:20px; padding:3px 10px; font-size:12px; font-weight:600; }
        .pay-list { width:100%; display:flex; flex-direction:column; gap:7px; margin-bottom:14px; }
        .pay-row {
          width:100%; background:#181818; border:1px solid #252525; border-radius:13px;
          padding:12px 15px; display:flex; align-items:center; gap:12px;
          cursor:pointer; transition:all .13s; text-align:left;
        }
        .pay-row:hover  { background:#1e1e1e; border-color:#333; }
        .pay-row:active { transform:scale(.98); }
        .pay-icon  { font-size:20px; flex-shrink:0; }
        .pay-info  { flex:1; display:flex; flex-direction:column; gap:1px; }
        .pay-name  { font-size:14px; font-weight:600; color:#fff; }
        .pay-desc  { font-size:11px; color:#484848; }
        .pay-arrow { font-size:18px; color:#383838; }

        /* Processing */
        .processing { gap:14px; padding:52px 24px; }
        .spinner { width:42px; height:42px; border:3px solid #1e1e1e; border-top-color:#f97316; border-radius:50%; animation:spin .75s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg) } }
        .proc-title { font-size:16px; font-weight:600; color:#fff; }
        .proc-sub   { font-size:13px; color:#484848; }
      `}</style>

      <div className="calc-wrap">
        {/* Header */}
        <div className="calc-header">
          <h1>Calculator</h1>
          <div className="header-right">
            {activePlan && (
              <div
                className="plan-pill"
                style={{
                  borderColor: activePlan.color,
                  color: activePlan.color,
                }}
              >
                {activePlan.name} · {answersLeft} left
              </div>
            )}
            <span className="version">v1.0</span>
          </div>
        </div>

        {/* Calc */}
        <div className="calc-card">
          <div className="display">
            <div className="display-sub">
              {previous && operator ? `${previous} ${operator}` : "\u00A0"}
            </div>
            <div className="display-main">{display}</div>
          </div>

          <div className="btn-grid">
            {/* Row 1 */}
            <button className="cbtn cbtn-fn" onClick={clear}>
              AC
            </button>
            <button className="cbtn cbtn-fn" onClick={backspace}>
              ⌫
            </button>
            <button
              className="cbtn cbtn-op"
              onClick={() => handleOperator("%")}
            >
              %
            </button>
            <button
              className="cbtn cbtn-op"
              onClick={() => handleOperator("/")}
            >
              ÷
            </button>
            {/* Row 2 */}
            {[7, 8, 9].map((n) => (
              <button
                key={n}
                className="cbtn cbtn-num"
                onClick={() => handleNumber(n.toString())}
              >
                {n}
              </button>
            ))}
            <button
              className="cbtn cbtn-op"
              onClick={() => handleOperator("*")}
            >
              ×
            </button>
            {/* Row 3 */}
            {[4, 5, 6].map((n) => (
              <button
                key={n}
                className="cbtn cbtn-num"
                onClick={() => handleNumber(n.toString())}
              >
                {n}
              </button>
            ))}
            <button
              className="cbtn cbtn-op"
              onClick={() => handleOperator("-")}
            >
              −
            </button>
            {/* Row 4 */}
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className="cbtn cbtn-num"
                onClick={() => handleNumber(n.toString())}
              >
                {n}
              </button>
            ))}
            <button
              className="cbtn cbtn-op"
              onClick={() => handleOperator("+")}
            >
              +
            </button>
            {/* Row 5 — pro ops, = spans rows 5+6 */}
            {["x²", "√", "1/x"].map((op) => (
              <button
                key={op}
                className={`cbtn cbtn-pro${!isPro ? " cbtn-locked" : ""}`}
                onClick={() => handleOperator(op)}
              >
                {!isPro && <span className="lock-ico">🔒</span>}
                {op}
              </button>
            ))}
            <button className="cbtn cbtn-eq" onClick={handleEquals}>
              =
            </button>
            {/* Row 6 — 0, ., (col 4 occupied by =) */}
            <button
              className="cbtn cbtn-num span2"
              onClick={() => handleNumber("0")}
            >
              0
            </button>
            <button className="cbtn cbtn-num" onClick={() => handleNumber(".")}>
              .
            </button>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="history">
            <h3>History</h3>
            {history.map((item, i) => (
              <div key={i} className="history-item">
                {item}
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        {modalStep && (
          <div
            className="overlay"
            onClick={() => {
              if (modalStep !== "processing") setModalStep(null);
            }}
          >
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              {modalStep === "lock" && (
                <div className="modal-inner">
                  <div className="modal-emoji">🔐</div>
                  <h2 className="modal-title">Answer Locked</h2>
                  <p className="modal-sub">Buy a plan to unlock your result</p>
                  <div className="expression">
                    {previous} {operator} {display}
                  </div>
                  <button
                    className="cta-btn"
                    onClick={() => setModalStep("plan")}
                  >
                    Choose a Plan →
                  </button>
                  <button
                    className="ghost-btn"
                    onClick={() => setModalStep(null)}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {modalStep === "plan" && (
                <div className="modal-inner">
                  <div className="modal-emoji">⚡</div>
                  <h2 className="modal-title">Choose Your Plan</h2>
                  <p className="modal-sub">
                    Unlock answers & advanced operators
                  </p>
                  <div className="plan-grid">
                    {PLANS.map((plan) => (
                      <div
                        key={plan.id}
                        className={`plan-card${plan.id === "pro" ? " plan-card-featured" : ""}`}
                        style={{ "--pc": plan.color } as React.CSSProperties}
                        onClick={() => choosePlan(plan)}
                      >
                        {plan.badge && (
                          <div className="plan-badge">{plan.badge}</div>
                        )}
                        <div className="plan-name">{plan.name}</div>
                        <div className="plan-price">{plan.price}</div>
                        <div className="plan-ans-box">
                          <span className="plan-ans-num">{plan.answers}</span>
                          <span className="plan-ans-label">
                            {plan.answers === 1 ? "answer" : "answers"}
                          </span>
                        </div>
                        <div className="plan-div" />
                        <ul className="plan-ops">
                          {/* available ops */}
                          {plan.operators.map((op) => (
                            <li key={op} className="op-available">
                              <span
                                className="op-chk"
                                style={{ color: plan.color }}
                              >
                                ✓
                              </span>
                              <code>{op}</code>
                            </li>
                          ))}
                          {/* locked ops (starter only) */}
                          {plan.lockedOperators.map((op) => (
                            <li key={op} className="op-locked">
                              <span className="op-cross">✕</span>
                              <code>{op}</code>
                            </li>
                          ))}
                        </ul>
                        <div
                          className="plan-cta-btn"
                          style={{
                            background:
                              plan.id === "pro"
                                ? "linear-gradient(135deg,#f97316,#eab308)"
                                : "linear-gradient(135deg,#3b82f6,#06b6d4)",
                          }}
                        >
                          Select {plan.name}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    className="ghost-btn"
                    onClick={() =>
                      setModalStep(secretResult !== "" ? "lock" : null)
                    }
                  >
                    ← Back
                  </button>
                </div>
              )}

              {modalStep === "payment" && selectedPlan && (
                <div className="modal-inner">
                  <div className="modal-emoji">💳</div>
                  <h2 className="modal-title">Payment Method</h2>
                  <p className="modal-sub">
                    <span
                      className="plan-tag"
                      style={{
                        color: selectedPlan.color,
                        borderColor: selectedPlan.color,
                      }}
                    >
                      {selectedPlan.name} — {selectedPlan.price}
                    </span>
                  </p>
                  <div className="pay-list">
                    {PAYMENT_METHODS.map((m) => (
                      <button
                        key={m.id}
                        className="pay-row"
                        onClick={() => choosePayment()}
                      >
                        <span className="pay-icon">{m.icon}</span>
                        <div className="pay-info">
                          <span className="pay-name">{m.name}</span>
                          <span className="pay-desc">{m.desc}</span>
                        </div>
                        <span className="pay-arrow">›</span>
                      </button>
                    ))}
                  </div>
                  <button
                    className="ghost-btn"
                    onClick={() => setModalStep("plan")}
                  >
                    ← Change Plan
                  </button>
                </div>
              )}

              {modalStep === "processing" && (
                <div className="modal-inner processing">
                  <div className="spinner" />
                  <p className="proc-title">Processing payment…</p>
                  <p className="proc-sub">Access unlocking soon ✨</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
