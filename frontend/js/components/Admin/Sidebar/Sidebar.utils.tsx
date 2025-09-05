import * as React from 'react'

export const URL_MAP = {
  contributions: [
    '/admin/reporting',
    '/admin/capco/app/reporting',
    '/admin/capco/app/proposal/',
    '/admin/capco/app/opinion/',
    '/admin/capco/app/reply/',
    '/admin/capco/app/opinionversion/',
    '/admin/capco/app/argument/',
    '/admin/capco/app/source/',
    '/admin/capco/app/comment/',
  ],
  contenus: [
    '/admin/capco/app/highlightedcontent/',
    '/admin/capco/app/theme/',
    '/admin/capco/app/post/',
    '/admin/capco/app/event/',
    '/admin/capco/app/video/',
    '/admin/capco/app/page/',
    '/admin/capco/media/media/',
  ],
  projets: [
    '/admin/capco/app/project/',
    '/admin/alpha/project/',
    '/admin/capco/app/appendixtype/',
    '/admin/capco/app/sourcecategory/',
    '/admin/capco/app/consultation/',
    '/admin/capco/app/proposalform/',
    '/admin/capco/app/questionnaire/',
    '/admin/capco/app/projecttype/',
  ],
  utilisateurs: [
    '/admin/capco/user/user/',
    '/admin/capco/user/invite/',
    '/admin/capco/app/group/',
    '/admin/capco/user/usertype/',
  ],
  reglages: [
    '/admin/locale/',
    '/admin/capco/app/menuitem/',
    '/admin/capco/app/socialnetwork/',
    '/admin/capco/app/footersocialnetwork/',
    '/admin-next/geographical-areas',
    '/admin/map/',
    '/admin/redirect/',
    '/admin/favicon/',
    '/admin/font/',
    '/admin/settings/settings.global/',
    '/admin/settings/settings.performance/',
    '/admin/settings/settings.modules/',
    '/admin/settings/settings.notifications/',
    '/admin/settings/settings.appearance/',
    '/admin/capco/app/sitecolor/',
  ],
  pages: [
    '/admin/settings/pages.members/',
    '/admin/capco/app/section/',
    '/admin/contact/',
    '/admin/settings/pages.homepage/',
    '/admin/settings/pages.blog/',
    '/admin/settings/pages.events/',
    '/admin/settings/pages.themes/',
    '/admin/settings/pages.projects/',
    '/admin/settings/pages.registration/',
    '/admin/settings/pages.login/',
    '/admin/settings/pages.footer/',
    '/admin/settings/pages.cookies/',
    '/admin/settings/pages.privacy/',
    '/admin/settings/pages.legal/',
    '/admin/settings/pages.charter/',
    '/admin/settings/pages.shield/',
  ],
  emailing: [
    '/admin/mailingCampaign/',
    '/admin/mailingList/',
    '/admin/capco/app/newslettersubscription/',
  ],
}

export const CAP_COLLECTIF_SVG: JSX.Element | JSX.Element[] | string = (
  <svg width="144" height="24" viewBox="0 0 144 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6.90705 8.97164C4.4575 8.97164 2.8408 10.7338 2.8408 13.4571C2.8408 16.1484 4.49016 17.9426 6.93971 17.9426H11.9858V19.865H6.67842C3.05309 19.865 0.619873 17.2698 0.619873 13.4571C0.619873 9.61243 3.05309 7.04929 6.67842 7.04929H11.5938V8.97164H6.90705Z"
      fill="#FEFCF6"
    />
    <path
      d="M36.7424 7.04929C40.4168 7.04929 42.8663 9.66048 42.8663 13.5693C42.8663 17.462 40.4168 20.0893 36.8241 20.0893C34.5868 20.0893 32.9701 19.2402 32.2843 17.1416L32.121 17.1737L32.17 19.5446L32.1863 23.133H29.9817V7.04929H36.7424ZM32.2189 15.2033C32.2189 16.9654 33.8356 18.1669 36.4975 18.1669C39.0287 18.1669 40.6617 16.3567 40.6617 13.5693C40.6617 10.7338 38.8817 8.97164 36.0729 8.97164H32.2189V15.2033V15.2033Z"
      fill="#FEFCF6"
    />
    <path
      d="M56.3064 8.97164C53.8568 8.97164 52.2401 10.7338 52.2401 13.4411C52.2401 16.1324 53.8895 17.9106 56.339 17.9106H61.3688V19.8329H56.0777C52.4524 19.8329 50.0355 17.2538 50.0355 13.4411C50.0355 9.61242 52.4524 7.04929 56.0777 7.04929H60.9768V8.97164H56.3064Z"
      fill="#FEFCF6"
    />
    <path
      d="M62.0872 13.4411C62.0872 9.61242 64.4387 7.04929 67.9497 7.04929H70.138C73.649 7.04929 76.0006 9.61242 76.0006 13.4411C76.0006 17.2538 73.649 19.8329 70.138 19.8329H67.9497C64.455 19.8329 62.0872 17.2538 62.0872 13.4411ZM68.4723 17.9106H69.6481C72.1956 17.9106 73.796 16.1645 73.796 13.4411C73.796 10.6857 72.2283 8.97164 69.6808 8.97164H68.456C65.9085 8.97164 64.3081 10.6857 64.3081 13.4411C64.2917 16.1965 65.8921 17.9106 68.4723 17.9106Z"
      fill="#FEFCF6"
    />
    <path
      d="M84.5905 19.8329H81.9123C79.4137 19.8329 77.895 18.9358 77.895 16.1004V7.04929H80.1159V16.0683C80.1159 17.5582 81.1121 17.9106 82.7778 17.9106H84.5905V19.8329Z"
      fill="#FEFCF6"
    />
    <path
      d="M92.6249 19.8329H89.9467C87.4482 19.8329 85.9294 18.9358 85.9294 16.1004V7.04929H88.1504V16.0683C88.1504 17.5582 89.1465 17.9106 90.8122 17.9106H92.6412V19.8329H92.6249Z"
      fill="#FEFCF6"
    />
    <path
      d="M109.266 8.97164V7.04929H114.165C117.79 7.04929 120.207 9.61242 120.207 13.4411C120.207 17.2538 117.79 19.8329 114.165 19.8329H108.874V17.9106H113.903C116.353 17.9106 118.002 16.1164 118.002 13.4411C118.002 10.7338 116.386 8.97164 113.936 8.97164H109.266Z"
      fill="#FEFCF6"
    />
    <path
      d="M124.436 8.97166V16.3567C124.436 17.398 125.041 17.9106 126.314 17.9106H129.417V19.833H126.314C123.506 19.833 122.216 18.7276 122.216 16.3887V8.97166H120.436V7.0493H122.216V3.47693H124.387L124.436 7.0493H127.98V8.97166H124.436Z"
      fill="#FEFCF6"
    />
    <path
      d="M133.402 19.833H131.181V7.04934H133.402V19.833ZM131.181 3.78134H133.402V5.94399H131.181V3.78134Z"
      fill="#FEFCF6"
    />
    <path
      d="M137.386 8.97168H135.492V7.04933H137.386V4.35803C137.386 1.65072 138.578 0.657501 141.861 0.657501H144V2.57986H141.861C140.326 2.57986 139.591 3.14054 139.591 4.42211V7.04933H143.526V8.97168H139.591V19.833H137.37V8.97168H137.386Z"
      fill="#FEFCF6"
    />
    <path
      d="M23.7272 8.98766L13.6677 19.849H16.7705L25.3602 10.5736V19.849H27.5812V10.5576C27.5812 8.21871 26.0951 7.01724 23.27 7.01724H14.5985V8.9396H23.0903C23.3026 8.9396 23.5149 8.95562 23.7272 8.98766Z"
      fill="#FEFCF6"
    />
    <path
      d="M97.279 17.8465L107.339 7.08132L104.252 7.0653L95.7277 16.1965L95.7603 7.03326L93.5394 7.01724L93.5067 16.2766C93.4904 18.5994 94.9765 19.8169 97.7853 19.8169L106.522 19.849L106.538 17.9266L97.9976 17.8946C97.7363 17.8946 97.5077 17.8785 97.279 17.8465Z"
      fill="#FEFCF6"
    />
  </svg>
);
