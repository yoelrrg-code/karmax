import React, { useId } from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * CheckMark Icon (22x22)
 */
export const CheckMarkIcon: React.FC<IconProps> = ({
  size,
  width = 22,
  height = 22,
  className = "",
  ...props
}) => {
  const clipId = useId();
  const w = size ?? width;
  const h = size ?? height;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <g clipPath={`url(#${clipId})`}>
        <path
          d="M18.7778 18.7778C23.0741 14.4815 23.0741 7.51852 18.7778 3.22222C14.4815 -1.07407 7.51852 -1.07407 3.22222 3.22222C-1.07407 7.51852 -1.07407 14.4815 3.22222 18.7778C7.51852 23.0741 14.486 23.0741 18.7778 18.7778ZM7.05612 9.31874L9.52974 11.7924L14.9484 6.37823L16.8653 8.29517L11.4512 13.7093L9.52974 15.6263L7.61279 13.7093L5.13917 11.2357L7.05612 9.31874Z"
          fill="currentColor"
          className="text-[#9DCF23]"
        />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width="22" height="22" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

/**
 * Cotiza / Quote Icon (18x20)
 */
export const CotizaIcon: React.FC<IconProps> = ({
  size,
  width = 18,
  height = 20,
  className = "",
  stroke = "currentColor",
  ...props
}) => {
  const w = size ?? width;
  const h = size ?? height;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 18 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M5 6H5.4"
        stroke={stroke}
        strokeWidth="1.77778"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 10H5.4"
        stroke={stroke}
        strokeWidth="1.77778"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 14H5.4"
        stroke={stroke}
        strokeWidth="1.77778"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 6H13"
        stroke={stroke}
        strokeWidth="1.77778"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 10H13"
        stroke={stroke}
        strokeWidth="1.77778"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 14H13"
        stroke={stroke}
        strokeWidth="1.77778"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="1" y="1" width="16" height="18" stroke={stroke} strokeWidth="2" />
    </svg>
  );
};

/**
 * Facebook Social Icon (32x32)
 */
export const FacebookIcon: React.FC<IconProps> = ({
  size,
  width = 32,
  height = 32,
  className = "",
  ...props
}) => {
  const w = size ?? width;
  const h = size ?? height;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 32 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle cx="16" cy="16" r="15.5" fill="#16C24A" stroke="#16C24A" />
      <path
        d="M11.8291 20.917V32.0386H16.4355V20.917H19.8704L20.1741 19.262L20.5826 17.0366H16.4355V15.664C16.4355 14.863 16.5582 14.2545 16.8313 13.8101C17.005 13.5282 17.2538 13.3003 17.5498 13.1519C17.99 12.9265 18.5741 12.8249 19.3223 12.8249C19.5809 12.8245 19.8395 12.8277 20.098 12.8344C20.3287 12.8383 20.5592 12.851 20.789 12.8725V9.35392C20.3915 9.25835 19.9882 9.18941 19.5816 9.14757C19.0387 9.08302 18.4524 9.03857 18.0281 9.03857C13.7847 9.03857 11.8291 11.0418 11.8291 15.3646V17.0366H9.21106V20.917H11.8291Z"
        fill="white"
      />
    </svg>
  );
};

/**
 * Instagram Social Icon (32x32)
 */
export const InstagramIcon: React.FC<IconProps> = ({
  size,
  width = 32,
  height = 32,
  className = "",
  ...props
}) => {
  const w = size ?? width;
  const h = size ?? height;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle cx="16" cy="16" r="15.5" fill="#16C24A" stroke="#16C24A" />
      <path
        d="M12.4796 7.55951C11.5752 7.60215 10.9576 7.74651 10.4177 7.95859C9.85894 8.1764 9.38528 8.46858 8.91403 8.94154C8.44285 9.41449 8.15257 9.88843 7.93639 10.4482C7.72715 10.9892 7.58534 11.6073 7.54539 12.5122C7.50544 13.4171 7.49659 13.708 7.50105 16.0163C7.50544 18.3245 7.51564 18.6139 7.55949 19.5207C7.60269 20.4249 7.74649 21.0423 7.95863 21.5824C8.1768 22.1412 8.46863 22.6147 8.9418 23.0861C9.41489 23.5575 9.88848 23.847 10.4495 24.0636C10.9901 24.2725 11.6084 24.415 12.5131 24.4546C13.4179 24.4942 13.7091 24.5034 16.0167 24.499C18.3243 24.4946 18.6148 24.4843 19.5214 24.4413C20.428 24.3983 21.0421 24.2535 21.5825 24.0423C22.1413 23.8237 22.6151 23.5323 23.0861 23.0591C23.5571 22.5858 23.8472 22.1115 24.0632 21.5515C24.2727 21.0109 24.415 20.3926 24.4543 19.4885C24.4939 18.5812 24.5033 18.2916 24.4989 15.9837C24.4944 13.6757 24.484 13.3864 24.441 12.4799C24.398 11.5735 24.254 10.9579 24.042 10.4175C23.8236 9.85868 23.532 9.38559 23.0591 8.91384C22.5862 8.44209 22.1114 8.15224 21.5517 7.9367C21.0107 7.72739 20.3928 7.5848 19.4881 7.5457C18.5833 7.5066 18.2921 7.49647 15.9837 7.501C13.6752 7.5054 13.3862 7.51531 12.4796 7.55951ZM12.5789 22.9254C11.7502 22.8894 11.3002 22.7517 11.0003 22.6364C10.6032 22.4834 10.3203 22.2985 10.0214 22.0025C9.72252 21.7065 9.53899 21.4226 9.38394 21.0264C9.26749 20.7265 9.12724 20.277 9.08849 19.4482C9.04634 18.5525 9.03749 18.2836 9.03253 16.0142C9.02757 13.7449 9.03629 13.4763 9.07553 12.5802C9.11094 11.7522 9.24949 11.3017 9.36453 11.0019C9.51753 10.6043 9.70183 10.3219 9.99848 10.0233C10.2951 9.7246 10.5782 9.54064 10.9748 9.38559C11.2744 9.26864 11.7238 9.1296 12.5522 9.09014C13.4486 9.04764 13.7172 9.03914 15.9862 9.03419C18.2552 9.02923 18.5245 9.03773 19.4213 9.07725C20.2493 9.11324 20.7 9.25044 20.9994 9.36625C21.3967 9.51925 21.6794 9.70299 21.9781 10.0002C22.2768 10.2973 22.4609 10.5793 22.6159 10.9768C22.733 11.2755 22.8721 11.7248 22.9112 12.5537C22.9539 13.4501 22.9636 13.7189 22.9676 15.9877C22.9717 18.2565 22.9637 18.526 22.9244 19.4217C22.8883 20.2505 22.7509 20.7006 22.6354 21.0009C22.4824 21.3978 22.298 21.6809 22.0012 21.9794C21.7044 22.2779 21.4217 22.4618 21.0249 22.6169C20.7257 22.7337 20.2757 22.8731 19.448 22.9125C18.5515 22.9547 18.2829 22.9635 16.0131 22.9685C13.7432 22.9734 13.4753 22.9642 12.5789 22.9254ZM19.5083 11.457C19.5087 11.6588 19.5688 11.8559 19.6812 12.0235C19.7936 12.191 19.9531 12.3215 20.1397 12.3984C20.3262 12.4753 20.5313 12.4951 20.7291 12.4554C20.9269 12.4156 21.1085 12.3182 21.2509 12.1752C21.3933 12.0323 21.4901 11.8503 21.5291 11.6524C21.5681 11.4544 21.5475 11.2494 21.4699 11.0631C21.3923 10.8769 21.2613 10.7178 21.0933 10.6061C20.9253 10.4943 20.728 10.4349 20.5262 10.4353C20.2558 10.4359 19.9966 10.5438 19.8057 10.7354C19.6148 10.927 19.5079 11.1866 19.5083 11.457ZM11.6356 16.0085C11.6403 18.4191 13.5981 20.3688 16.0081 20.3642C18.4183 20.3596 20.3693 18.4021 20.3648 15.9915C20.3602 13.5809 18.402 11.6306 15.9915 11.6354C13.5811 11.6401 11.631 13.5982 11.6356 16.0085ZM13.1666 16.0054C13.1655 15.4451 13.3306 14.8969 13.641 14.4304C13.9514 13.9639 14.3932 13.5998 14.9105 13.3844C15.4278 13.1689 15.9974 13.1116 16.5472 13.2199C17.097 13.3281 17.6024 13.597 17.9994 13.9924C18.3965 14.3879 18.6673 14.8922 18.7777 15.4416C18.8882 15.991 18.8332 16.5607 18.6198 17.0789C18.4064 17.597 18.0441 18.0403 17.5788 18.3525C17.1135 18.6648 16.566 18.832 16.0056 18.8332C15.6335 18.834 15.2649 18.7614 14.9209 18.6197C14.5768 18.478 14.264 18.27 14.0004 18.0074C13.7368 17.7448 13.5274 17.4328 13.3844 17.0893C13.2413 16.7458 13.1673 16.3775 13.1666 16.0054Z"
        fill="white"
      />
    </svg>
  );
};

/**
 * LinkedIn Social Icon (32x32)
 */
export const LinkedinIcon: React.FC<IconProps> = ({
  size,
  width = 32,
  height = 32,
  className = "",
  ...props
}) => {
  const w = size ?? width;
  const h = size ?? height;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle cx="16" cy="16" r="15.5" fill="#16C24A" stroke="#16C24A" />
      <path
        d="M12.0251 23.4731H8.55681V12.3117H12.0251V23.4731ZM10.2696 10.9415C9.17412 10.9415 8.46582 10.1654 8.46582 9.20553C8.46582 8.22604 9.19553 7.47314 10.3142 7.47314C11.4328 7.47314 12.1179 8.22604 12.1393 9.20553C12.1393 10.1654 11.4328 10.9415 10.2696 10.9415ZM24.6924 23.4731H21.2241V17.2876C21.2241 15.8478 20.721 14.8701 19.4667 14.8701C18.5086 14.8701 17.9395 15.532 17.6879 16.169C17.5952 16.3955 17.572 16.7167 17.572 17.036V23.4714H14.1019V15.871C14.1019 14.4776 14.0573 13.3126 14.0109 12.3099H17.0242L17.183 13.8603H17.2526C17.7094 13.1324 18.828 12.0583 20.6995 12.0583C22.9814 12.0583 24.6924 13.5873 24.6924 16.8737V23.4731Z"
        fill="white"
      />
    </svg>
  );
};

/**
 * Mail Icon (24x24)
 */
export const MailIcon: React.FC<IconProps> = ({
  size,
  width = 24,
  height = 24,
  className = "",
  stroke = "currentColor",
  ...props
}) => {
  const clipId = useId();
  const w = size ?? width;
  const h = size ?? height;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <g clipPath={`url(#${clipId})`}>
        <path
          d="M3 3H21C22.2375 3 23.25 4.0125 23.25 5.25V18.75C23.25 19.9875 22.2375 21 21 21H3C1.7625 21 0.75 19.9875 0.75 18.75V5.25C0.75 4.0125 1.7625 3 3 3Z"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M23.25 5.25L12 13.125L0.75 5.25"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

/**
 * Map Pin Icon (24x24)
 */
export const MapPinIcon: React.FC<IconProps> = ({
  size,
  width = 24,
  height = 24,
  className = "",
  stroke = "currentColor",
  ...props
}) => {
  const w = size ?? width;
  const h = size ?? height;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M22 10C22 17 12 23 12 23C12 23 2 17 2 10C2 7.61305 3.05357 5.32387 4.92893 3.63604C6.8043 1.94821 9.34784 1 12 1C14.6522 1 17.1957 1.94821 19.0711 3.63604C20.9464 5.32387 22 7.61305 22 10Z"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * Phone Icon (24x24)
 */
export const PhoneIcon: React.FC<IconProps> = ({
  size,
  width = 24,
  height = 24,
  className = "",
  stroke = "currentColor",
  ...props
}) => {
  const clipId = useId();
  const w = size ?? width;
  const h = size ?? height;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <g clipPath={`url(#${clipId})`}>
        <path
          d="M23.0339 17.4351V20.747C23.0351 21.0544 22.9721 21.3588 22.849 21.6405C22.7258 21.9222 22.5451 22.1751 22.3186 22.3829C22.092 22.5908 21.8245 22.749 21.5333 22.8475C21.242 22.946 20.9334 22.9826 20.6272 22.9549C17.2301 22.5858 13.967 21.425 11.1 19.5657C8.43266 17.8708 6.1712 15.6093 4.47625 12.942C2.61053 10.062 1.44945 6.78295 1.08709 3.37061C1.0595 3.06533 1.09578 2.75765 1.19362 2.46716C1.29146 2.17666 1.44871 1.90973 1.65537 1.68334C1.86202 1.45695 2.11356 1.27607 2.39395 1.15222C2.67434 1.02837 2.97745 0.964263 3.28397 0.963974H6.59586C7.13162 0.958701 7.65102 1.14842 8.05724 1.49778C8.46347 1.84713 8.7288 2.33228 8.80378 2.86279C8.94357 3.92267 9.20281 4.96333 9.57656 5.96492C9.72509 6.36006 9.75723 6.78949 9.66919 7.20233C9.58114 7.61518 9.37659 7.99413 9.07977 8.29428L7.67774 9.69632C9.24929 12.4601 11.5377 14.7485 14.3015 16.3201L15.7035 14.9181C16.0037 14.6212 16.3827 14.4167 16.7955 14.3286C17.2083 14.2406 17.6378 14.2727 18.0329 14.4213C19.0345 14.795 20.0752 15.0543 21.135 15.1941C21.6713 15.2697 22.1611 15.5398 22.5112 15.953C22.8613 16.3662 23.0473 16.8937 23.0339 17.4351Z"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

/**
 * TikTok Social Icon (32x32)
 */
export const TiktokIcon: React.FC<IconProps> = ({
  size,
  width = 32,
  height = 32,
  className = "",
  ...props
}) => {
  const w = size ?? width;
  const h = size ?? height;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle cx="16" cy="16" r="15.5" fill="#16C24A" stroke="#16C24A" />
      <path
        d="M15.8195 7.015C16.802 7 17.777 7.0075 18.752 7C18.812 8.14749 19.2245 9.31747 20.0645 10.1275C20.9045 10.96 22.0894 11.3424 23.2444 11.4699V14.4924C22.1644 14.4549 21.077 14.2299 20.0945 13.7649C19.667 13.5699 19.2695 13.3224 18.8795 13.0674C18.872 15.2574 18.887 17.4474 18.8645 19.6298C18.8045 20.6798 18.4595 21.7223 17.852 22.5848C16.8695 24.0248 15.167 24.9623 13.4195 24.9923C12.3471 25.0523 11.2746 24.7598 10.3596 24.2198C8.84461 23.3273 7.77962 21.6923 7.62212 19.9373C7.60712 19.5623 7.59962 19.1873 7.61462 18.8199C7.74962 17.3949 8.45461 16.0299 9.5496 15.0999C10.7946 14.0199 12.5346 13.5024 14.162 13.8099C14.177 14.9199 14.132 16.0299 14.132 17.1399C13.3895 16.8999 12.5196 16.9674 11.8671 17.4174C11.3946 17.7249 11.0346 18.1974 10.8471 18.7299C10.6896 19.1123 10.7346 19.5323 10.7421 19.9373C10.9221 21.1673 12.1071 22.2023 13.367 22.0898C14.207 22.0823 15.0095 21.5948 15.4445 20.8823C15.587 20.6348 15.7445 20.3798 15.752 20.0873C15.827 18.7449 15.797 17.4099 15.8045 16.0674C15.812 13.0449 15.797 10.03 15.8195 7.015Z"
        fill="white"
      />
    </svg>
  );
};

/**
 * User / Account Icon (18x20)
 */
export const UserIcon: React.FC<IconProps> = ({
  size,
  width = 18,
  height = 20,
  className = "",
  stroke = "currentColor",
  ...props
}) => {
  const w = size ?? width;
  const h = size ?? height;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 18 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M17 19V17C17 15.9391 16.5786 14.9217 15.8284 14.1716C15.0783 13.4214 14.0609 13 13 13H5C3.93913 13 2.92172 13.4214 2.17157 14.1716C1.42143 14.9217 1 15.9391 1 17V19"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 9C11.2091 9 13 7.20914 13 5C13 2.79086 11.2091 1 9 1C6.79086 1 5 2.79086 5 5C5 7.20914 6.79086 9 9 9Z"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * WhatsApp Icon (20x20)
 */
export const WhatsappIcon: React.FC<IconProps> = ({
  size,
  width = 20,
  height = 20,
  className = "",
  fill = "currentColor",
  ...props
}) => {
  const w = size ?? width;
  const h = size ?? height;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.6706 11.9561C14.4264 11.8224 13.2269 11.175 13.0017 11.0835C12.7769 10.9923 12.6128 10.9447 12.4374 11.1873C12.2622 11.4295 11.7645 11.9718 11.6137 12.1324C11.4622 12.293 11.3165 12.308 11.0721 12.1739C10.8284 12.0406 10.0368 11.7477 9.11856 10.8652C8.40419 10.1783 7.93562 9.34556 7.79966 9.0914C7.66368 8.83682 7.79865 8.70716 7.92785 8.58811C8.04388 8.48062 8.18756 8.30672 8.3174 8.16627C8.44681 8.02586 8.49243 7.92382 8.58157 7.76102C8.67047 7.59812 8.63474 7.45124 8.577 7.3246C8.51937 7.1982 8.06792 5.95552 7.87932 5.45001C7.69081 4.94451 7.48075 5.01971 7.33552 5.01391C7.19043 5.00892 7.02542 4.98165 6.8596 4.97554C6.69382 4.96932 6.42188 5.0215 6.18486 5.26174C5.94764 5.50198 5.28254 6.07935 5.23682 7.30337C5.19097 8.52658 6.03764 9.74256 6.1557 9.91281C6.27387 10.0836 7.7725 12.7359 10.2629 13.8267C12.754 14.9172 12.7671 14.5847 13.2241 14.5603C13.6814 14.5362 14.7179 14.0134 14.9471 13.4409C15.1761 12.8682 15.1945 12.3704 15.1363 12.2643C15.0779 12.1584 14.9148 12.0895 14.6706 11.9561ZM10.1025 17.8527C8.45549 17.8527 6.92148 17.3586 5.64064 16.5118L2.52401 17.5095L3.53702 14.4978C2.56618 13.1604 1.99254 11.5177 1.99254 9.74256C1.99254 5.27029 5.63083 1.63181 10.1025 1.63181C14.575 1.63181 18.2131 5.27029 18.2131 9.74256C18.2131 14.2145 14.575 17.8527 10.1025 17.8527ZM10.1025 0C4.72229 0 0.360523 4.36177 0.360523 9.74256C0.360523 11.5831 0.871264 13.3046 1.75834 14.7732L0 20L5.39382 18.2733C6.78964 19.0448 8.39463 19.485 10.1025 19.485C15.4837 19.485 19.8452 15.1228 19.8452 9.74256C19.8452 4.36177 15.4837 0 10.1025 0Z"
        fill={fill}
      />
    </svg>
  );
};

export const iconsMap = {
  "check-mark": CheckMarkIcon,
  cotiza: CotizaIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  mail: MailIcon,
  "map-pin": MapPinIcon,
  phone: PhoneIcon,
  tiktok: TiktokIcon,
  user: UserIcon,
  whatsapp: WhatsappIcon,
} as const;

export type IconName = keyof typeof iconsMap;

export interface DynamicIconProps extends IconProps {
  name: IconName;
}

/**
 * Dynamic unified Icon component:
 * <Icon name="cotiza" size={20} className="text-green-500" />
 */
export const Icon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  const Component = iconsMap[name];
  if (!Component) return null;
  return <Component {...props} />;
};

export default Icon;
