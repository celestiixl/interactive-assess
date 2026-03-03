import { extendTheme } from "@mui/joy/styles";

/**
 * Biospark Joy UI theme — full component coverage.
 *
 * Color variables come from globals.css:
 *   --ia-grad-from  #0ea5e9  (sky)
 *   --ia-grad-via   #2563eb  (blue)
 *   --ia-grad-to    #4f46e5  (indigo)
 *   --ia-emerald    16 185 129
 *   --ia-teal       20 184 166
 *   --ia-amber      245 158 11
 *   --ia-violet     139 92 246
 *   --ia-rose       251 113 133
 */
const joyTheme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          solidBg: "#2563eb",
          solidHoverBg: "#1d4ed8",
          solidActiveBg: "#1e40af",
          outlinedBorder: "#2563eb",
          outlinedColor: "#2563eb",
          outlinedHoverBg: "#eff6ff",
          softBg: "#eff6ff",
          softColor: "#1e40af",
          softHoverBg: "#dbeafe",
          softActiveBg: "#bfdbfe",
          plainColor: "#2563eb",
          plainHoverBg: "#eff6ff",
        },
        success: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          solidBg: "#10b981",
          solidHoverBg: "#059669",
          softBg: "#ecfdf5",
          softColor: "#065f46",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          solidBg: "#f59e0b",
          solidHoverBg: "#d97706",
          softBg: "#fffbeb",
          softColor: "#92400e", // amber-800
        },
        danger: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          solidBg: "#f43f5e",
          solidHoverBg: "#e11d48",
          softBg: "#fff1f2",
          softColor: "#9f1239",
        },
        neutral: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        background: {
          body: "rgb(248, 250, 252)",
          surface: "rgb(255, 255, 255)",
          popup: "rgb(255, 255, 255)",
          level1: "rgb(241, 245, 249)",
          level2: "rgb(226, 232, 240)",
          level3: "rgb(203, 213, 225)",
          tooltip: "rgb(15, 23, 42)",
          backdrop: "rgba(15, 23, 42, 0.5)",
        },
        text: {
          primary: "rgb(15, 23, 42)",
          secondary: "rgb(71, 85, 105)",
          tertiary: "rgb(148, 163, 184)",
          icon: "rgb(71, 85, 105)",
        },
      },
    },
  },

  fontFamily: {
    body: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
    display: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
    code: "var(--font-geist-mono), ui-monospace, monospace",
  },

  radius: {
    xs: "6px",
    sm: "8px",
    md: "14px",
    lg: "24px",
    xl: "28px",
  },

  shadow: {
    xs: "0 1px 2px rgba(15,23,42,0.06)",
    sm: "0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.06)",
    md: "0 4px 6px rgba(15,23,42,0.07), 0 2px 4px rgba(15,23,42,0.06)",
    lg: "0 10px 15px rgba(15,23,42,0.08), 0 4px 6px rgba(15,23,42,0.05)",
    xl: "0 20px 25px rgba(15,23,42,0.08), 0 10px 10px rgba(15,23,42,0.04)",
  },

  components: {
    /* ── Buttons ── */
    JoyButton: {
      defaultProps: { size: "sm" },
      styleOverrides: {
        root: ({ ownerState }) => ({
          fontWeight: 600,
          borderRadius: "14px",
          transition: "filter 0.15s, transform 0.1s, background 0.15s",
          "&:active": { transform: "translateY(1px)" },
          ...(ownerState.variant === "solid" &&
            ownerState.color === "primary" && {
              background: "linear-gradient(to right, #0ea5e9, #2563eb)",
              "&:hover": {
                background: "linear-gradient(to right, #0284c7, #1d4ed8)",
                filter: "brightness(1.06)",
              },
            }),
          ...(ownerState.variant === "solid" &&
            ownerState.color === "success" && {
              background: "linear-gradient(to right, #10b981, #059669)",
              "&:hover": { filter: "brightness(1.06)" },
            }),
        }),
      },
    },

    JoyIconButton: {
      defaultProps: { size: "sm", variant: "soft" },
      styleOverrides: {
        root: {
          borderRadius: "10px",
          transition: "transform 0.1s",
          "&:active": { transform: "scale(0.95)" },
        },
      },
    },

    /* ── Cards / Surfaces ── */
    JoyCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: {
          borderRadius: "28px",
          boxShadow:
            "0 1px 0 rgba(15,23,42,0.04), 0 18px 50px rgba(15,23,42,0.08)",
          transition: "box-shadow 0.2s, transform 0.2s",
          "&:hover": {
            boxShadow:
              "0 1px 0 rgba(15,23,42,0.06), 0 24px 60px rgba(15,23,42,0.12)",
            transform: "translateY(-2px)",
          },
        },
      },
    },

    JoySheet: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          borderRadius: "24px",
          ...(ownerState.variant === "soft" && {
            backdropFilter: "blur(10px)",
            background: "rgba(255,255,255,0.76)",
            border: "1px solid rgb(226,232,240)",
          }),
        }),
      },
    },

    /* ── Typography ── */
    JoyTypography: {
      styleOverrides: {
        root: {
          letterSpacing: "-0.01em",
        },
      },
    },

    /* ── Chips / Badges ── */
    JoyChip: {
      styleOverrides: {
        root: {
          borderRadius: "9999px",
          fontWeight: 700,
          fontSize: "12px",
          transition: "transform 0.1s",
          "&:active": { transform: "scale(0.97)" },
        },
      },
    },

    JoyBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 700,
          fontSize: "11px",
          borderRadius: "9999px",
          minWidth: "18px",
          height: "18px",
          padding: "0 5px",
        },
      },
    },

    /* ── Progress indicators ── */
    JoyLinearProgress: {
      defaultProps: { size: "sm" },
      styleOverrides: {
        root: ({ ownerState }) => ({
          "--LinearProgress-radius": "9999px",
          "--LinearProgress-thickness": ownerState.size === "lg" ? "10px" : ownerState.size === "md" ? "8px" : "6px",
          borderRadius: "9999px",
          ...(ownerState.color === "success" && {
            "--LinearProgress-progressColor":
              "linear-gradient(90deg, #10b981, #059669)",
          }),
          ...(ownerState.color === "primary" && {
            "--LinearProgress-progressColor":
              "linear-gradient(90deg, #0ea5e9, #2563eb)",
          }),
          ...(ownerState.color === "warning" && {
            "--LinearProgress-progressColor":
              "linear-gradient(90deg, #fbbf24, #f59e0b)",
          }),
          ...(ownerState.color === "danger" && {
            "--LinearProgress-progressColor":
              "linear-gradient(90deg, #fb7185, #f43f5e)",
          }),
        }),
      },
    },

    JoyCircularProgress: {
      defaultProps: { size: "md" },
      styleOverrides: {
        root: {
          "--CircularProgress-trackThickness": "4px",
          "--CircularProgress-progressThickness": "4px",
        },
      },
    },

    /* ── Tabs ── */
    JoyTabs: {
      defaultProps: { defaultValue: 0 },
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
          borderRadius: "14px",
        },
      },
    },

    JoyTabList: {
      styleOverrides: {
        root: {
          borderRadius: "9999px",
          padding: "4px",
          backgroundColor: "rgb(241,245,249)",
          gap: "2px",
          border: "none",
          boxShadow: "inset 0 1px 2px rgba(15,23,42,0.06)",
        },
      },
    },

    JoyTab: {
      styleOverrides: {
        root: {
          borderRadius: "9999px",
          fontWeight: 600,
          fontSize: "14px",
          transition: "background 0.15s, box-shadow 0.15s",
          "&[aria-selected='true']": {
            backgroundColor: "#fff",
            boxShadow:
              "0 1px 3px rgba(15,23,42,0.1), 0 1px 2px rgba(15,23,42,0.06)",
          },
        },
      },
    },

    /* ── Form controls ── */
    JoyInput: {
      styleOverrides: {
        root: {
          borderRadius: "14px",
          transition: "box-shadow 0.15s",
          "&:focus-within": {
            boxShadow: "0 0 0 3px rgba(37,99,235,0.18)",
          },
        },
      },
    },

    JoyTextarea: {
      styleOverrides: {
        root: {
          borderRadius: "14px",
          "&:focus-within": {
            boxShadow: "0 0 0 3px rgba(37,99,235,0.18)",
          },
        },
      },
    },

    JoySelect: {
      styleOverrides: {
        root: {
          borderRadius: "14px",
        },
        listbox: {
          borderRadius: "14px",
          boxShadow:
            "0 4px 6px rgba(15,23,42,0.07), 0 10px 15px rgba(15,23,42,0.08)",
        },
      },
    },

    JoyFormLabel: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: "13px",
          letterSpacing: "0.01em",
        },
      },
    },

    JoyCheckbox: {
      styleOverrides: {
        root: {
          "--Checkbox-size": "18px",
          borderRadius: "6px",
        },
        checkbox: {
          borderRadius: "6px",
        },
      },
    },

    JoyRadio: {
      styleOverrides: {
        root: {
          "--Radio-size": "18px",
        },
      },
    },

    JoySwitch: {
      styleOverrides: {
        root: {
          "--Switch-trackRadius": "9999px",
          "--Switch-thumbSize": "16px",
        },
      },
    },

    JoySlider: {
      styleOverrides: {
        root: {
          "--Slider-thumbSize": "16px",
          "--Slider-trackRadius": "9999px",
          "--Slider-thumbRadius": "9999px",
          "& .JoySlider-thumb": {
            transition: "box-shadow 0.15s",
          },
        },
      },
    },

    /* ── Overlay / feedback ── */
    JoyAlert: {
      styleOverrides: {
        root: {
          borderRadius: "14px",
          fontWeight: 500,
        },
      },
    },

    JoyTooltip: {
      defaultProps: { placement: "top" },
      styleOverrides: {
        root: {
          borderRadius: "8px",
          fontSize: "12px",
          fontWeight: 600,
          padding: "5px 10px",
          boxShadow:
            "0 4px 6px rgba(15,23,42,0.1), 0 2px 4px rgba(15,23,42,0.08)",
        },
      },
    },

    JoyModal: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(4px)",
        },
      },
    },

    JoyModalDialog: {
      styleOverrides: {
        root: {
          borderRadius: "28px",
          boxShadow:
            "0 20px 60px rgba(15,23,42,0.2), 0 8px 20px rgba(15,23,42,0.1)",
        },
      },
    },

    /* ── Avatar ── */
    JoyAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: "13px",
          "--Avatar-size": "36px",
        },
        img: {
          borderRadius: "inherit",
        },
      },
    },

    /* ── Divider ── */
    JoyDivider: {
      styleOverrides: {
        root: {
          "--Divider-gap": "16px",
        },
      },
    },

    /* ── List ── */
    JoyListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: "10px",
          fontWeight: 500,
          transition: "background 0.12s",
        },
      },
    },

    /* ── Accordion ── */
    JoyAccordion: {
      styleOverrides: {
        root: {
          borderRadius: "14px",
          "&:not(:last-child)": {
            marginBottom: "4px",
          },
        },
      },
    },
  },
});

export default joyTheme;
