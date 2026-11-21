import {
  BorderRadius,
  BorderWidth,
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
  MediaQueries,
  Opacity,
  Padding,
} from "./variables";

describe("Styles", () => {
  // WCAG relative luminance and contrast ratio, for every text colour on every surface it sits on.
  const luminance = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  const surfaces = [Colors.richBlack, Colors.midnight, Colors.surface];
  const textOnDark = [
    Colors.lightGray,
    Colors.midGray,
    Colors.brand.accentLight,
    Colors.flag.block,
    Colors.flag.warn,
    Colors.flag.ok,
  ];

  it.each(textOnDark.flatMap((text) => surfaces.map((bg) => [text, bg])))(
    "%s text on %s passes WCAG AA",
    (text, bg) => {
      expect(contrast(text, bg)).toBeGreaterThanOrEqual(4.5);
    }
  );

  it.each([Colors.brand.accent, Colors.brand.accentHover])(
    "ink text on the %s button passes WCAG AA",
    (bg) => {
      expect(contrast(Colors.ink, bg)).toBeGreaterThanOrEqual(4.5);
    }
  );

  it("should have the correct padding values", () => {
    expect(Padding.small).toEqual("4px");
    expect(Padding.medium).toEqual("8px");
    expect(Padding.large).toEqual("16px");
    expect(Padding.xlarge).toEqual("32px");
    expect(Padding.xxlarge).toEqual("48px");
  });

  it("should have the correct font size values", () => {
    expect(FontSize.small).toEqual("12px");
    expect(FontSize.medium).toEqual("16px");
    expect(FontSize.large).toEqual("24px");
    expect(FontSize.xlarge).toEqual("32px");
    expect(FontSize.xxlarge).toEqual("64px");
  });

  it("should have the correct font family values", () => {
    expect(FontFamily.display).toEqual(
      '"Barlow Condensed", "Arial Narrow", system-ui, sans-serif'
    );
    expect(FontFamily.primary).toEqual(
      '"Inter Variable", system-ui, -apple-system, sans-serif'
    );
  });

  it("should have the correct font weight values", () => {
    expect(FontWeight.light).toEqual("300");
    expect(FontWeight.regular).toEqual("400");
    expect(FontWeight.semibold).toEqual("600");
    expect(FontWeight.bold).toEqual("700");
  });

  it("should have the correct border radius values", () => {
    expect(BorderRadius.small).toEqual("4px");
    expect(BorderRadius.medium).toEqual("8px");
    expect(BorderRadius.large).toEqual("16px");
    expect(BorderRadius.xlarge).toEqual("32px");
    expect(BorderRadius.xxlarge).toEqual("64px");
  });

  it("should have the correct border width values", () => {
    expect(BorderWidth.small).toEqual("1px");
    expect(BorderWidth.medium).toEqual("2px");
    expect(BorderWidth.large).toEqual("4px");
    expect(BorderWidth.xlarge).toEqual("8px");
    expect(BorderWidth.xxlarge).toEqual("16px");
  });

  it("should have the correct opacity values", () => {
    expect(Opacity.small).toEqual("0.25");
    expect(Opacity.medium).toEqual("0.5");
    expect(Opacity.large).toEqual("0.75");
    expect(Opacity.xlarge).toEqual("0.9");
    expect(Opacity.xxlarge).toEqual("1");
  });

  it("should have the correct media query values", () => {
    expect(MediaQueries.SM).toEqual("(min-width: 360px)");
    expect(MediaQueries.MD).toEqual("(min-width: 768px)");
    expect(MediaQueries.LG).toEqual("(min-width: 992px)");
    expect(MediaQueries.XL).toEqual("(min-width: 1200px)");
  });
});
