export function Insignia({ small = false }: { small?: boolean }) {
  return (
    <svg
      className={small ? "insignia small" : "insignia"}
      viewBox="0 0 100 112"
      aria-hidden="true"
    >
      <path
        d="M50 4 87 18v38c0 25-18 41-37 51C31 97 13 81 13 56V18Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M50 12 78 23v32c0 20-13 34-28 43-15-9-28-23-28-43V23Z"
        fill="none"
        stroke="currentColor"
        opacity=".45"
      />
      <path
        d="m50 24 5 16 17 .1-13.6 10 5.1 16L50 56l-13.5 10.1 5.1-16L28 40.1l17-.1Z"
        fill="currentColor"
      />
      <path d="M47 49h6v39h-6zM36 76h28v3H36z" fill="currentColor" />
    </svg>
  );
}
export function Building() {
  return (
    <svg
      className="building"
      viewBox="0 0 1400 740"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="windows"
          width="42"
          height="53"
          patternUnits="userSpaceOnUse"
        >
          <rect width="42" height="53" fill="#252e2c" />
          <rect x="14" y="12" width="15" height="29" fill="#101b1a" />
          <path d="M21 12v29M14 25h15" stroke="#46504a" strokeWidth="1" />
        </pattern>
        <pattern
          id="masonry"
          width="120"
          height="28"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0 0h120M60 0v28M0 28h120" stroke="#647067" opacity=".12" />
        </pattern>
        <linearGradient id="sky" x2="0" y2="1">
          <stop stopColor="#132326" />
          <stop offset="1" stopColor="#3b4942" />
        </linearGradient>
      </defs>
      <rect width="1400" height="740" fill="url(#sky)" />
      <circle cx="1090" cy="120" r="43" fill="#adad8e" opacity=".16" />
      <path
        d="M-50 400 200 345 200 270 610 270 610 220 810 220 810 270 1220 270 1220 345 1450 400v360H-50Z"
        fill="#38413b"
      />
      <path
        d="M200 293h410v370H200zM810 293h410v370H810zM625 264h170v399H625z"
        fill="url(#windows)"
      />
      <path
        d="M-50 400 200 345v318H-50zM1220 345l230 55v263h-230z"
        fill="url(#windows)"
      />
      <path
        d="M610 245h200v24H610zM190 273h420v16H190zM810 273h420v16H810zM-50 650h1500v17H-50z"
        fill="#566055"
      />
      <path d="M0 400h1400v260H0z" fill="url(#masonry)" />
      <path d="M682 663V539q28-42 56 0v124" fill="#101917" />
      <path d="M697 660V549h26v111" fill="#bab28b" opacity=".35" />
      {[270, 438, 564, 850, 976, 1144].map((x, i) => (
        <rect
          key={x}
          x={x}
          y={i % 2 ? 413 : 360}
          width="15"
          height="29"
          fill="#c1ab6d"
          opacity={i % 2 ? 0.45 : 0.24}
        />
      ))}
      <path d="M690 220v-46h7v46" fill="#57625a" />
      <path d="m697 175 62 7-9 17-53-8Z" fill="#703b30" />
      <path d="M0 706q370-36 700-15t700 0v49H0Z" fill="#0e1817" />
      <path d="M0 716h1400M0 732h1400" stroke="#6b7569" opacity=".18" />
      <path
        d="M85 694V539q-25-35 0-40 25 5 0 40m-17-27h34M1325 694V539q-25-35 0-40 25 5 0 40m-17-27h34"
        stroke="#101a18"
        strokeWidth="5"
        fill="none"
      />
    </svg>
  );
}
export function Portrait({ variant = 0 }: { variant?: number }) {
  return (
    <svg
      viewBox="0 0 100 130"
      className="portrait"
      role="img"
      aria-label="Retrato ilustrado do investigado"
    >
      <defs>
        <pattern
          id={`lines${variant}`}
          width="3"
          height="3"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0 0h3" stroke="#fff" opacity=".12" />
        </pattern>
      </defs>
      <path fill="#65665c" d="M0 0h100v130H0z" />
      <path d="M5 130v-18q6-22 31-26h28q25 4 31 26v18" fill="#292f2a" />
      <path d="m38 83-5 13 17 24 17-24-5-13" fill="#aeaa94" />
      <path d="m45 102 5 6 5-6-2 28h-6z" fill="#343b32" />
      <path d="M26 41q0-31 24-31t24 31v18q-1 33-24 35T26 59" fill="#b2b09b" />
      <path
        d={
          variant % 2
            ? "M25 46Q16 3 54 8q28 1 22 41L62 28 28 37Z"
            : "M25 44Q17 5 53 7q29 2 23 39l-10-8-2-15Q39 39 28 31Z"
        }
        fill="#30362e"
      />
      <path
        d="m31 49 12-2m14 0 12 2M48 51l-4 17h9m-14 9q11 5 22-1"
        fill="none"
        stroke="#575b4c"
        strokeWidth="2"
      />
      <path d="M32 53h9M59 53h9" stroke="#3c4438" strokeWidth="3" />
      <path d="M0 0h100v130H0z" fill={`url(#lines${variant})`} />
    </svg>
  );
}
export function EvidencePhoto() {
  return (
    <svg
      viewBox="0 0 440 245"
      className="evidence-photo"
      role="img"
      aria-label="Ilustração de plataforma ferroviária à noite, rosto não identificável"
    >
      <rect width="440" height="245" fill="#8c8b78" />
      <path
        d="M0 0h440v27H0zM30 0h9v210h-9M208 0h9v170h-9M405 0h9v220h-9M0 33l440 132"
        fill="#343e36"
      />
      <path d="m0 100 440 55v65L0 160Z" fill="#434e43" />
      {[0, 58, 116, 174, 232, 290, 348, 406].map((x) => (
        <path
          key={x}
          d={`m${x} ${109 + x * 0.12} 33 4v29l-33-4Z`}
          fill="#a6a48e"
        />
      ))}
      <path
        d="m0 195 440-30M0 223l440-42M0 245l440-51"
        stroke="#4c5549"
        strokeWidth="4"
      />
      <circle
        cx="118"
        cy="58"
        r="22"
        fill="#c3beaa"
        stroke="#303c33"
        strokeWidth="4"
      />
      <path d="M118 41v17l-13-1" stroke="#303c33" strokeWidth="3" />
      <path
        d="m286 146-7 65h29l-4-65m-14-30q-18 2-17 20 1 17 17 18 16-1 15-18-1-18-15-20"
        fill="#26342b"
      />
      <path d="M0 0h440v245H0z" fill="none" stroke="#333d32" strokeWidth="9" />
      <text x="18" y="230" fill="#d0c7aa" fontSize="10" fontFamily="monospace">
        КИЕВСКИЙ · НЕГАТИВ 04 / 1983
      </text>
    </svg>
  );
}
