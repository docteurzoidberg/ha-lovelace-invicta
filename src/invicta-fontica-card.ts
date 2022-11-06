/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, TemplateResult, css, PropertyValues, CSSResultGroup } from 'lit';
import { query } from 'lit-element';

import { customElement, property, state } from 'lit/decorators';
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  ActionHandlerEvent,
  handleAction,
  LovelaceCardEditor,
  getLovelace,
} from 'custom-card-helpers'; // This is a community maintained npm module with common helper functions/types. https://github.com/custom-cards/custom-card-helpers

import type { InvictaFonticaCardConfig } from './types';
import { CARD_VERSION } from './const';
import { localize } from './localize/localize';

/* eslint no-console: 0 */
console.info(
  `%c INVICTA-FONTICA-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'invicta-fontica-card',
  name: 'Invicta Fontica Stove Card',
  description: 'A card to see and manage Invicta Fontica pellet stove',
});

@customElement('invicta-fontica-card')
export class InvictaFonticaCard extends LitElement {
  @query('#base') canvas!: HTMLCanvasElement;
  width = 8;
  height = 16;
  fps = 12;
  canvasWidth = 300;
  canvasHeight = 100;
  max_flame_height = 1000;
  max_heat_spots = 1000;
  min_x_attenuation = 500;
  min_flame_height = 300;
  min_heat_spots = 300;
  max_x_attenuation = 500;
  init_flame_height = 1;
  init_heat_spots = 1000;
  init_x_attenuation = 5000;
  speed = 15000;
  starting_speed = 1000;
  periodicity = 7200000;
  timer = 0;
  current_flame_height = 0;
  current_heat_spots = 0;
  current_x_attenuation = 0;

  apow(a, b) {
    return 1000 + ((a - 1000) * b) / 1000;
  }

  int_lerp(a, b, c) {
    if (c <= 0) return a;
    if (c >= 1000) return b;
    return (a * (1000 - c) + b * c) / 1000;
  }

  rnd(x, y) {
    const X = x ^ 64228;
    const Y = y ^ 61356;
    return ((((X * 71521 + Y * 13547) ^ 35135) % 1000) + 1000) % 1000;
  }

  noise(X, Y, T, flame_height, heat_spots, x_attenuation) {
    const x = X;
    let n = 0;

    const attenuation =
        ((((this.height - Y) * 1000) / this.height) * 1000) / flame_height +
        (x_attenuation == 0
        ? 0
        : Math.max(
          0,
          this.apow(
            1000 -
            ((X + 1) * (this.width - X) * 4000) /
            ((this.width + 2) * (this.width + 2)),
            1000000 / x_attenuation
          )
        ));

    let sum_coeff = 0;

    for (let i = 8; i > 0; i >>= 1) {
      const y = Y + (T * 8) / i;
      const rnd_00 = this.rnd(x / i, y / i);
      const rnd_01 = this.rnd(x / i, y / i + 1);
      const rnd_10 = this.rnd(x / i + 1, y / i);
      const rnd_11 = this.rnd(x / i + 1, y / i + 1);
      const coeff = i;
      const dx = x % i;
      const dy = y % i;
      n +=
        (((rnd_00 * (i - dx) + rnd_10 * dx) * (i - dy) +
          (rnd_01 * (i - dx) + rnd_11 * dx) * dy) *
        coeff) /
        (i * i);
      sum_coeff += coeff;
    }
    return Math.max(
      0,
      this.apow(
        n / sum_coeff,
        ((1000000 / heat_spots) * 1000) / (attenuation + 1000)
      ) - attenuation
    );
  }

  heat_color(heat) {
    const r = Math.min(255, (heat * 255) / 333);
    const g = Math.min(255, Math.max(0, ((heat - 333) * 255) / 333));
    const b = Math.min(255, Math.max(0, ((heat - 667) * 255) / 333));
    return { r, g, b };
  }

  render() {
    return html`
      <ha-card>
        <h1 class="card-header">Toto</h1>
        <div class='mycard card-content'>
          <div class='container'>
            <svg
              width="150"
              height="300"
              viewBox="0 0 52.653812 109.28134"
              version="1.1"
              id="svg22105"
              inkscape:version="1.1.2 (b8e25be833, 2022-02-05)"
              sodipodi:docname="poele.svg"
              xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
              xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:svg="http://www.w3.org/2000/svg">
              <sodipodi:namedview
                id="namedview22107"
                pagecolor="#505050"
                bordercolor="#eeeeee"
                borderopacity="1"
                inkscape:pageshadow="0"
                inkscape:pageopacity="0"
                inkscape:pagecheckerboard="0"
                inkscape:document-units="mm"
                showgrid="false"
                fit-margin-top="0"
                fit-margin-left="0"
                fit-margin-right="0"
                fit-margin-bottom="0"
                inkscape:zoom="1.0368618"
                inkscape:cx="363.11494"
                inkscape:cy="120.55609"
                inkscape:window-width="1920"
                inkscape:window-height="1009"
                inkscape:window-x="-8"
                inkscape:window-y="-8"
                inkscape:window-maximized="1"
                inkscape:current-layer="layer1" />
              <defs
                id="defs22102">
                <radialGradient
                  inkscape:collect="always"
                  xlink:href="#linearGradient8270-6"
                  id="radialGradient10925"
                  cx="41.50061"
                  cy="90.460258"
                  fx="41.50061"
                  fy="90.460258"
                  r="14.864063"
                  gradientTransform="matrix(3.9630391,-0.03726077,0.18913992,20.116839,-81.73062,-1653.7599)"
                  gradientUnits="userSpaceOnUse" />
                <linearGradient
                  inkscape:collect="always"
                  id="linearGradient8270-6">
                  <stop
                    style="stop-color:#ffffff;stop-opacity:1;"
                    offset="0"
                    id="stop8266" />
                  <stop
                    style="stop-color:#ffffff;stop-opacity:0;"
                    offset="1"
                    id="stop8268" />
                </linearGradient>
                <radialGradient
                  inkscape:collect="always"
                  xlink:href="#linearGradient15912"
                  id="radialGradient15914"
                  cx="29.839443"
                  cy="104.68076"
                  fx="29.839443"
                  fy="104.68076"
                  r="17.25979"
                  gradientTransform="matrix(-0.03487198,2.059131,-0.96803468,-0.01062614,128.87572,30.837896)"
                  gradientUnits="userSpaceOnUse" />
                <linearGradient
                  inkscape:collect="always"
                  id="linearGradient15912">
                  <stop
                    style="stop-color:#880000;stop-opacity:1"
                    offset="0"
                    id="stop15908" />
                  <stop
                    style="stop-color:#ff1919;stop-opacity:1"
                    offset="1"
                    id="stop15910" />
                </linearGradient>
                <radialGradient
                  inkscape:collect="always"
                  xlink:href="#linearGradient8270-6"
                  id="radialGradient8272"
                  cx="41.500607"
                  cy="62.866039"
                  fx="41.500607"
                  fy="62.866039"
                  r="13.026425"
                  gradientTransform="matrix(1,0,0,0.05702736,-15.08261,16.756949)"
                  gradientUnits="userSpaceOnUse" />
                <radialGradient
                  inkscape:collect="always"
                  xlink:href="#linearGradient8270-6"
                  id="radialGradient8274"
                  cx="41.500607"
                  cy="65.511871"
                  fx="41.500607"
                  fy="65.511871"
                  r="13.026425"
                  gradientTransform="matrix(1,0,0,0.05702736,-15.08261,19.251899)"
                  gradientUnits="userSpaceOnUse" />
                <radialGradient
                  inkscape:collect="always"
                  xlink:href="#linearGradient8270-6"
                  id="radialGradient8276"
                  cx="41.500607"
                  cy="68.157707"
                  fx="41.500607"
                  fy="68.157707"
                  r="13.026425"
                  gradientTransform="matrix(1,0,0,0.05702736,-15.08261,21.74685)"
                  gradientUnits="userSpaceOnUse" />
                <linearGradient
                  inkscape:collect="always"
                  xlink:href="#linearGradient11021-4"
                  id="linearGradient15532"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="matrix(-1.2390704,0,0,-0.9103861,82.199526,136.00165)"
                  x1="59.915852"
                  y1="94.505432"
                  x2="68.550285"
                  y2="94.760605" />
                <linearGradient
                  inkscape:collect="always"
                  id="linearGradient11021-4">
                  <stop
                    style="stop-color:#ff0000;stop-opacity:1"
                    offset="0"
                    id="stop11017" />
                  <stop
                    style="stop-color:#464646;stop-opacity:1"
                    offset="1"
                    id="stop11019" />
                </linearGradient>
                <radialGradient
                  inkscape:collect="always"
                  xlink:href="#linearGradient21862"
                  id="radialGradient19154"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="matrix(-0.03541882,2.8919589,-0.98321482,-0.01492394,130.22258,9.300553)"
                  cx="29.839443"
                  cy="104.68076"
                  fx="29.839443"
                  fy="104.68076"
                  r="17.25979" />
                <linearGradient
                  inkscape:collect="always"
                  id="linearGradient21862">
                  <stop
                    style="stop-color:#880000;stop-opacity:1"
                    offset="0"
                    id="stop21858" />
                  <stop
                    style="stop-color:#ff3636;stop-opacity:1"
                    offset="1"
                    id="stop21860" />
                </linearGradient>
                <linearGradient
                  inkscape:collect="always"
                  xlink:href="#linearGradient19443"
                  id="linearGradient19163"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="matrix(1.2391697,0,0,1.0595531,-29.36975,-45.899972)"
                  x1="59.915852"
                  y1="94.505432"
                  x2="68.550285"
                  y2="94.760605" />
                <linearGradient
                  inkscape:collect="always"
                  id="linearGradient19443">
                  <stop
                    style="stop-color:#ff0000;stop-opacity:1"
                    offset="0"
                    id="stop19439" />
                  <stop
                    style="stop-color:#464646;stop-opacity:1"
                    offset="1"
                    id="stop19441" />
                </linearGradient>
              </defs>
              <g
                inkscape:label="Layer 1"
                inkscape:groupmode="layer"
                id="layer1">
                <rect
                  style="fill:#000000;fill-opacity:0.582329;stroke:none;stroke-width:2.92174;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
                  id="rect183"
                  width="52.640656"
                  height="4.7222629"
                  x="-2.6660157e-06"
                  y="4.6850585e-07" />
                <path
                  id="rect1666"
                  style="fill:#000000;fill-opacity:1;stroke:none;stroke-width:7.14709;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
                  d="M 30.925781 17.847656 L 30.925781 384.29297 L 168.76953 384.29297 L 168.76953 17.847656 L 30.925781 17.847656 z M 80.324219 137.77539 L 119.37109 137.77539 C 125.65267 137.77539 130.71094 142.83366 130.71094 149.11523 L 130.71094 243.13672 C 130.71094 249.41829 125.65267 254.47461 119.37109 254.47461 L 80.324219 254.47461 C 74.042644 254.47461 68.984375 249.41829 68.984375 243.13672 L 68.984375 149.11523 C 68.984375 142.83366 74.042644 137.77539 80.324219 137.77539 z "
                  transform="scale(0.26458333)" />
                <path
                  id="rect1712"
                  style="fill:url(#radialGradient10925);fill-opacity:1;stroke:none;stroke-width:7.04307;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
                  d="M 43.667969 26.382812 L 43.667969 302.55469 L 156.02734 302.55469 L 156.02734 26.382812 L 43.667969 26.382812 z M 80.324219 137.77539 L 119.37109 137.77539 C 125.65267 137.77539 130.70898 142.83366 130.70898 149.11523 L 130.70898 243.13672 C 130.70898 249.41829 125.65267 254.47461 119.37109 254.47461 L 80.324219 254.47461 C 74.042644 254.47461 68.984375 249.41829 68.984375 243.13672 L 68.984375 149.11523 C 68.984375 142.83366 74.042644 137.77539 80.324219 137.77539 z "
                  transform="scale(0.26458333)" />
                <rect
                  style="fill:url(#radialGradient15914);fill-opacity:1;stroke:none;stroke-width:2.49108;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
                  id="rect1736"
                  width="34.519581"
                  height="14.161144"
                  x="9.2407503"
                  y="84.088295" />
                <path
                  id="rect1894"
                  style="fill:#808080;fill-opacity:1;stroke:#000000;stroke-width:0.603001;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:0.30923694"
                  d="m 16.914214,31.094225 c -1.662001,0 -2.999817,1.338333 -2.999817,3.000335 v 33.29719 c 0,1.662001 1.337816,2.999817 2.999817,2.999817 h 19.007624 c 1.661999,0 2.999817,-1.337816 2.999817,-2.999817 V 34.09456 c 0,-1.662002 -1.337818,-3.000335 -2.999817,-3.000335 z m 4.338235,5.358846 h 10.331154 c 1.661999,0 2.999817,1.338334 2.999817,3.000333 v 24.876003 c 0,1.661999 -1.337818,3.000333 -2.999817,3.000333 H 21.252449 c -1.661998,0 -3.000332,-1.338334 -3.000332,-3.000333 V 39.453404 c 0,-1.661999 1.338334,-3.000333 3.000332,-3.000333 z" />
                <rect
                  style="fill:#000000;fill-opacity:1;stroke:#fdffff;stroke-width:0.2;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:0.365462"
                  id="rect4112"
                  width="25.85285"
                  height="1.2857252"
                  x="13.491574"
                  y="12.516106"
                  rx="0.40000001"
                  ry="0.40000001" />
                <rect
                  style="fill:#000000;fill-opacity:1;stroke:#fdffff;stroke-width:0.2;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:0.365462"
                  id="rect4522"
                  width="25.85285"
                  height="1.2857252"
                  x="13.491574"
                  y="17.355114"
                  rx="0.40000001"
                  ry="0.40000001" />
                <rect
                  style="fill:#000000;fill-opacity:1;stroke:#fdffff;stroke-width:0.2;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:0.365462"
                  id="rect4524"
                  width="25.85285"
                  height="1.2857252"
                  x="13.491574"
                  y="14.935612"
                  rx="0.40000001"
                  ry="0.40000001" />
                <rect
                  style="fill:#000000;fill-opacity:1;stroke:#fdffff;stroke-width:0.2;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:0.365462"
                  id="rect4526"
                  width="25.85285"
                  height="1.2857252"
                  x="13.491574"
                  y="10.0966"
                  rx="0.40000001"
                  ry="0.40000001" />
                <rect
                  style="fill:#000000;fill-opacity:1;stroke:#fdffff;stroke-width:0.2;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:0.365462"
                  id="rect4528"
                  width="25.85285"
                  height="1.2857252"
                  x="13.491574"
                  y="7.6770978"
                  rx="0.40000001"
                  ry="0.40000001" />
                <rect
                  style="opacity:0.4;fill:url(#radialGradient8272);fill-opacity:1;stroke:#000000;stroke-width:0.2;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
                  id="rect7107"
                  width="25.85285"
                  height="1.2857252"
                  x="13.491574"
                  y="19.699169"
                  rx="0.40000001"
                  ry="0.40000001" />
                <rect
                  style="opacity:0.4;fill:url(#radialGradient8274);fill-opacity:1;stroke:#000000;stroke-width:0.2;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
                  id="rect7109"
                  width="25.85285"
                  height="1.2857252"
                  x="13.491574"
                  y="22.345005"
                  rx="0.40000001"
                  ry="0.40000001" />
                <rect
                  style="opacity:0.4;fill:url(#radialGradient8276);fill-opacity:1;stroke:#000000;stroke-width:0.2;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
                  id="rect7111"
                  width="25.85285"
                  height="1.2857252"
                  x="13.491574"
                  y="24.990841"
                  rx="0.40000001"
                  ry="0.40000001" />
                <path
                  id="rect13410"
                  style="fill:#000000;fill-opacity:1;stroke:none;stroke-width:3.65236;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
                  d="m 52.57194,97.584974 c -0.18546,0.11578 -0.37494,0.23035 -0.56839,0.34365 -0.4288,0.24208 -0.87578,0.47803 -1.34023,0.70745 -0.4647,0.22932 -0.94662,0.45199 -1.44496,0.66766 -0.49812,0.21583 -1.01241,0.42454 -1.54206,0.6258 -0.5298,0.201106 -1.07466,0.394656 -1.6337,0.580326 -0.55898,0.18583 -1.13185,0.3637 -1.7177,0.5333 -0.58587,0.16949 -1.1844,0.33063 -1.79461,0.48317 -0.61026,0.1526 -1.23189,0.29651 -1.86389,0.4315 -0.63181,0.1348 -1.27363,0.26061 -1.92444,0.37724 -0.65117,0.11681 -1.311,0.22435 -1.97843,0.32246 -0.66698,0.0981 -1.34118,0.18665 -2.02154,0.26562 -0.6806,0.0789 -1.367,0.14823 -2.05807,0.20774 -0.69099,0.0596 -1.3863,0.10942 -2.08481,0.14934 -0.69867,0.0397 -1.40017,0.0695 -2.10335,0.0894 -0.70308,0.02 -1.40748,0.03 -2.11208,0.03 -0.70459,-2e-5 -1.409,-0.01 -2.11208,-0.03 -0.703,-0.0199 -1.40431,-0.0497 -2.1028,-0.0894 -0.69852,-0.0399 -1.39382,-0.0897 -2.08481,-0.14934 -0.69108,-0.0595 -1.37747,-0.12879 -2.05808,-0.20774 -0.68072,-0.079 -1.35529,-0.16755 -2.02262,-0.26562 -0.66706,-0.0981 -1.32653,-0.20566 -1.97735,-0.32246 -0.65117,-0.11662 -1.29336,-0.24243 -1.92552,-0.37724 -0.63182,-0.13499 -1.25327,-0.2789 -1.86334,-0.4315 -0.61022,-0.15254 -1.20875,-0.31368 -1.79462,-0.48317 -0.58585,-0.1696 -1.15872,-0.34747 -1.7177,-0.5333 -0.55885,-0.18568 -1.10353,-0.37923 -1.63315,-0.580326 -0.53002,-0.20125 -1.04468,-0.40996 -1.54315,-0.6258 -0.49797,-0.21568 -0.97952,-0.43835 -1.44387,-0.66766 -0.46482,-0.22942 -0.91217,-0.46536 -1.34133,-0.70745 -0.19325,-0.11313 -0.38255,-0.22752 -0.56783,-0.34313 v 1.48363 l 0.0747,0.940966 c 0.12043,2.17262 2.45333,3.3219 6.38375,4.97288 h 39.63694 c 3.93043,-1.65098 6.14489,-3.74122 6.26533,-5.913846 h 0.0158 v -0.18035 z"
                  sodipodi:nodetypes="ccccccccccsccccccccsccccccscccccccccccc" />
                <path
                  id="rect15530"
                  style="fill:url(#linearGradient15532);fill-opacity:1;stroke:none;stroke-width:3.95769;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none"
                  d="M 0.18244572,4.7221923 V 92.989161 h 6.4e-4 v 6.080252 a 40.802372,13.983885 0 0 0 0.77029,0.33486 40.802372,13.983885 0 0 0 2.17448998,0.806137 40.802372,13.983885 0 0 0 2.3531304,0.74569 40.802372,13.983885 0 0 0 2.51577,0.67955 40.802372,13.983885 0 0 0 0.18568,0.0424 V 92.989161 78.966751 4.7221923 Z" />
                <path
                  id="path19151"
                  style="fill:url(#radialGradient19154);fill-opacity:1;stroke:none;stroke-width:2.97523;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
                  d="m 8.71159,101.64091 a 33.446213,13.703263 0 0 0 1.70897,0.43549 33.446213,13.703263 0 0 0 1.93046,0.42233 33.446213,13.703263 0 0 0 1.99345,0.37017 33.446213,13.703263 0 0 0 2.04804,0.31601 33.446213,13.703263 0 0 0 2.09474,0.26027 33.446213,13.703263 0 0 0 2.13149,0.20357 33.446213,13.703263 0 0 0 2.15931,0.14635 33.446213,13.703263 0 0 0 2.1782,0.0876 33.446213,13.703263 0 0 0 2.18765,0.0294 33.446213,13.703263 0 0 0 2.18713,-0.0294 33.446213,13.703263 0 0 0 2.1782,-0.0876 33.446213,13.703263 0 0 0 2.15931,-0.14635 33.446213,13.703263 0 0 0 2.13149,-0.20357 33.446213,13.703263 0 0 0 2.09474,-0.26027 33.446213,13.703263 0 0 0 2.04803,-0.31601 33.446213,13.703263 0 0 0 1.99398,-0.37017 33.446213,13.703263 0 0 0 1.83546,-0.40156 V 84.088294 H 8.71159 Z" />
                <path
                  id="path19160"
                  style="fill:url(#linearGradient19163);fill-opacity:1;stroke:none;stroke-width:4.26982;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none"
                  d="m 44.65381,4.722075 v 73.143859 15.87242 7.939556 a 40.805643,13.9839 0 0 0 2.59025,-0.59272 40.805643,13.9839 0 0 0 2.51597,-0.67955 40.805643,13.9839 0 0 0 2.35332,-0.745686 40.805643,13.9839 0 0 0 0.54046,-0.20051 V 93.738354 80.074064 4.722075 Z" />
                <path
                  id="path20133"
                  style="fill:#2b2e2d;fill-opacity:1;stroke:none;stroke-width:1.4787;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
                  d="m 0.19653,99.712854 0.007,1.302906 v 0 c 0.27112,4.58897 11.78619,8.26355 25.90188,8.26558 14.11569,-0.002 25.63077,-3.67661 25.90189,-8.26558 h 0.0161 v -0.16199 -1.171046 c -0.18423,0.104 -0.37246,0.20689 -0.56464,0.30866 -0.42587,0.217436 -0.8698,0.429356 -1.33107,0.635416 -0.46142,0.20597 -0.93993,0.40598 -1.43475,0.59969 -0.49466,0.19385 -1.00539,0.38131 -1.53137,0.56208 -0.52599,0.18062 -1.06693,0.35446 -1.62195,0.52123 -0.55516,0.16692 -1.12413,0.32668 -1.70599,0.47901 -0.58174,0.15224 -1.17606,0.29697 -1.78198,0.43398 -0.60601,0.13706 -1.22332,0.26633 -1.85092,0.38757 -0.6275,0.12107 -1.26495,0.23408 -1.91132,0.33883 -0.64647,0.10491 -1.30154,0.20151 -1.96415,0.28963 -0.66249,0.0881 -1.33216,0.16765 -2.00794,0.23857 -0.67584,0.0709 -1.35743,0.13314 -2.04367,0.18659 -0.68619,0.0536 -1.37667,0.0983 -2.07034,0.13414 -0.69373,0.0356 -1.39025,0.0624 -2.08845,0.0803 -0.69823,0.018 -1.39778,0.027 -2.09752,0.027 -0.69956,-2e-5 -1.39894,-0.009 -2.09701,-0.027 -0.6982,-0.0179 -1.39472,-0.0446 -2.08845,-0.0803 -0.69367,-0.0359 -1.38415,-0.0806 -2.07034,-0.13414 -0.68624,-0.0535 -1.36783,-0.11568 -2.04367,-0.18659 -0.67595,-0.071 -1.34579,-0.15048 -2.00844,-0.23857 -0.66244,-0.0882 -1.31734,-0.18472 -1.96365,-0.28963 -0.64654,-0.10474 -1.28415,-0.21775 -1.91182,-0.33883 -0.62744,-0.12125 -1.24457,-0.25051 -1.85042,-0.38757 C 9.37762,103.08578 8.7833,102.94105 8.20156,102.78881 7.6197,102.63648 7.05073,102.47672 6.49557,102.3098 5.94055,102.14303 5.39961,101.96919 4.87361,101.78857 4.34747,101.60781 3.83658,101.42034 3.34175,101.22649 2.8471,101.03278 2.36876,100.83277 1.90751,100.6268 1.44607,100.42075 1.00197,100.20882 0.57593,99.991384 0.38394,99.889774 0.19671,99.712854 0.19671,99.712854 Z"
                  sodipodi:nodetypes="ccccccccccccccccccscccccccsccccccccscsc" />
                <rect
                  style="fill:#ffff00;fill-opacity:0;stroke:#000000;stroke-width:0.431;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:0.698795"
                  id="rect22369"
                  width="16.331331"
                  height="30.876421"
                  x="18.252348"
                  y="36.453293"
                  ry="3"
                  rx="3" />
              </g>
            </svg>
            <canvas
              id="base"
              width=${this.canvasWidth}
              height=${this.canvasHeight}
            ></canvas>
          &nbsp;
          </div>
          <div class='controls'>

                <div class="info  pointer text-content " title="Stove Power Control">Stove Power Control</div>
                <div class="flex">
                  <ha-slider value="4">

                  </ha-slider>
                </div>



          </div>
        </div>

      </ha-card>
    `;
  }

  async firstUpdated() {
    requestAnimationFrame((timestamp) => this._loop(timestamp));
    window.addEventListener('resize', () => this._updateSize(), false);
    this._updateSize();
  }

  _updateSize() {
    this.canvasWidth = this.width *10;
    this.canvasHeight = this.height *10;
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
  }

  _lastRender = 0;
  _loop(timestamp: number) {
    this.loop();
    this._lastRender = timestamp;
    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      ctx.save();
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.draw(ctx);
      ctx.restore();
    }
    requestAnimationFrame((timestamp) => this._loop(timestamp));
  }

  loop() {
    const millis = () => new Date().getTime();
    this.timer = millis();
    const begin_time =
        this.timer > this.starting_speed ? 1000 : (this.timer * 1000) / this.starting_speed;

    // must be signed let
    let periodic_time = this.timer % this.periodicity;
    periodic_time = (periodic_time * 1000) / this.periodicity;
    if (periodic_time > 500) periodic_time = 1000 - periodic_time;

    this.current_flame_height = this.int_lerp(
      this.int_lerp(this.init_flame_height, this.max_flame_height, begin_time),
      this.min_flame_height,
      periodic_time
    );
    this.current_heat_spots = this.int_lerp(
      this.int_lerp(this.init_heat_spots, this.max_heat_spots, begin_time),
      this.min_heat_spots,
      periodic_time
    );
    this.current_x_attenuation = this.int_lerp(
      this.int_lerp(this.init_x_attenuation, this.min_x_attenuation, begin_time),
      this.max_x_attenuation,
      periodic_time
    );

  }

  draw(ctx) {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const heat = this.heat_color(
          this.noise(
            x,
            y,
            Math.floor((this.timer * this.fps) / 1000),
            this.current_flame_height,
            this.current_heat_spots,
            this.current_x_attenuation
          )
        );
        ctx.fillStyle = "rgba(" + heat.r + "," + heat.g + "," + heat.b + ", 0.9)";
        ctx.fillRect(x*10, y*10, 10, 10);
      }
    }
    ctx.strokeStyle = "black";
    for(let x = 0; x < this.canvasWidth; x+=10){
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.canvasHeight);
        ctx.stroke();
    }
    for(let y = 0; y < this.canvasHeight; y+=10){
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.canvasWidth, y);
        ctx.stroke();
      }

  }

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import('./editor');
    return document.createElement('invicta-fontica-card-editor');
  }

  public static getStubConfig(): Record<string, unknown> {
    return {};
  }

  // TODO Add any properities that should cause your element to re-render here
  // https://lit.dev/docs/components/properties/
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private config!: InvictaFonticaCardConfig;

  // https://lit.dev/docs/components/properties/#accessors-custom
  public setConfig(config: InvictaFonticaCardConfig): void {
    // TODO Check for required fields and that they are of the proper format
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this.config = {
      name: 'Invicta Fontica',
      ...config,
    };
  }

  // https://lit.dev/docs/components/lifecycle/#reactive-update-cycle-performing
  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  // https://lit.dev/docs/components/styles/
  static get styles(): CSSResultGroup {
    return css`
    .mycard {
      height: 300px;
    }
    .container {
      position: absolute;
      float: left;
    }
    .controls {
      margin-left: 150px;
    }
    .container * {
      position: absolute;
    }
    canvas {
      position: relative;
      left: 40px;
      top: 56px;
      z-index: 1;
    }
    svg {
      z-index: 2;
    }
    `;
  }
}
