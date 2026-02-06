import QuizImageMode from "./features/quiz-image/QuizImageMode";

export default function App() {
  return (
    <div className="container">
      <header style={{ marginBottom: 18 }}>
        {/* <div className="badge">PWA - offline-first - no login</div> */}
        <h1 style={{ margin: "10px 0 0", fontSize: 28 }}>Verb Trainer by Kush</h1>
        <p style={{ margin: "6px 0 0", opacity: 0.85 }}>
          Mode 1: Look at the image and pick the correct verb (infinitive).
        </p>
      </header>

      <QuizImageMode optionsCount={4} />
      {/* <footer style={{ marginTop: 18, opacity: 0.7, fontSize: 12 }}>
        Tip: for best offline behavior we are using local images in <code>/public/images</code>.
      </footer> */}
    </div>
  );
}
