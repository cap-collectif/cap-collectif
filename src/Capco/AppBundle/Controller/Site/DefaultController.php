<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Mailer\Message\MessagesList;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Handler\CasHandler;
use Doctrine\ORM\NoResultException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class DefaultController extends Controller
{
    /**
     * @Route("/login_check", name="login_check", options={"i18n" = false})
     */
    public function loginAction(Request $request)
    {
        if (
            $this->get(Manager::class)->isActive('shield_mode') &&
            !$this->getUser()->isEmailConfirmed()
        ) {
            if ($request->getSession()) {
                $request->getSession()->invalidate();
            }

            return $this->json([
                'success' => false,
                'reason' => 'please-confirm-your-email-address-to-login',
            ]);
        }

        if (!$this->getUser()) {
            return $this->json([
                'success' => false,
            ]);
        }

        return $this->json([
            'success' => true,
        ]);
    }

    /**
     * @Route("/login-saml", name="saml_login", options={"i18n" = false}, defaults={"_feature_flags" = "login_saml"})
     */
    public function loginSamlAction(Request $request)
    {
        return $this->redirect($this->getSafeRedirectDestinationFromRequest($request));
    }

    /**
     * @Route("/login-cas", name="cas_login", options={"i18n" = false}, defaults={"_feature_flags" = "login_cas"})
     */
    public function loginCasAction(Request $request, CasHandler $casHandler)
    {
        return $casHandler->login($this->getSafeRedirectDestinationFromRequest($request));
    }

    /**
     * @Route("/login-paris", name="paris_login", options={"i18n" = false}, defaults={"_feature_flags" = "login_paris"})
     */
    public function loginParisAction(Request $request)
    {
        return $this->redirect($this->getSafeRedirectDestinationFromRequest($request));
    }

    /**
     * @Route("/contact", name="app_contact")
     * @Template("CapcoAppBundle:Contact:list.html.twig")
     */
    public function contactAction(Request $request)
    {
        return [];
    }

    /**
     * @Route("/cookies-page", name="app_cookies")
     * @Template("CapcoAppBundle:Default:cookies.html.twig")
     */
    public function cookiesAction(Request $request)
    {
        try {
            $cookiesList = $this->get(SiteParameterRepository::class)->getValue(
                'cookies-list',
                $request->getLocale()
            );
        } catch (NoResultException $exception) {
            return $this->createNotFoundException();
        }

        return [];
    }

    /**
     * @Route("/privacy", name="app_privacy")
     * @Template("CapcoAppBundle:Default:privacyPolicy.html.twig")
     */
    public function privacyPolicyAction(Request $request)
    {
        try {
            $policy = $this->get(SiteParameterRepository::class)->getValue(
                'privacy-policy',
                $request->getLocale()
            );
        } catch (NoResultException $exception) {
            return $this->createNotFoundException();
        }

        return [
            'privacy' => html_entity_decode($policy),
        ];
    }

    /**
     * @Route("/legal", name="app_legal")
     * @Template("CapcoAppBundle:Default:legalMentions.html.twig")
     */
    public function legalMentionsAction(Request $request)
    {
        try {
            $legal = $this->get(SiteParameterRepository::class)->getValue(
                'legal-mentions',
                $request->getLocale()
            );
        } catch (NoResultException $exception) {
            return $this->createNotFoundException();
        }

        return [
            'legal' => html_entity_decode($legal),
        ];
    }

    /**
     * use this to integrate your email template
     * Only accessible in dev environment.
     *
     * @Route("/email/{messageType}", name="app_email", condition="'%kernel.environment%' === 'dev'")
     */
    public function emailAction(Request $request, string $messageType)
    {
        if (isset(MessagesList::MESSAGES_LIST[$messageType])) {
            $messager = MessagesList::MESSAGES_LIST[$messageType];
            $data = $messager::mockData($this->container);

            return $this->render(MessagesList::TEMPLATE_LIST[$messageType], $data);
        }

        throw new NotFoundHttpException("${messageType} message doesnt exist");
    }

    /**
     * use this to integrate your pdf template
     * Only accessible in dev environment.
     *
     * @Route("/render_pdf/{messageType}", name="app_render_pdf", condition="'%kernel.environment%' === 'dev'")
     */
    public function renderPdfAction(Request $request, string $messageType = 'siret')
    {
        $str = '{   "entreprise":{
      "siren":"803377571",
      "capital_social":14000,
      "numero_tva_intracommunautaire":"FR12803377571",
      "forme_juridique":"SAS, société par actions simplifiée",
      "forme_juridique_code":"5710",
      "nom_commercial":"CAP COLLECTIF",
      "procedure_collective":false,
      "enseigne":null,
      "libelle_naf_entreprise":"Édition de logiciels système et de réseau",
      "naf_entreprise":"5829A",
      "raison_sociale":"CAP COLLECTIF",
      "siret_siege_social":"80337757100036",
      "code_effectif_entreprise":"12",
      "date_creation":1400191200,
      "nom":null,
      "prenom":null,
      "date_radiation":null,
      "categorie_entreprise":"PME",
      "tranche_effectif_salarie_entreprise":{
         "de":20,
         "a":49,
         "code":"12",
         "date_reference":"2018",
         "intitule":"20 à 49 salariés"
      },
      "mandataires_sociaux":[
         {
            "nom":"PEREIRA LAGE",
            "prenom":"CYRIL",
            "fonction":"PRESIDENT",
            "date_naissance":"1976-10-23",
            "date_naissance_timestamp":214873200,
            "dirigeant":true,
            "raison_sociale":"",
            "identifiant":"",
            "type":"PP"
         },
         {
            "nom":"",
            "prenom":"",
            "fonction":"COMMISSAIRE AUX COMPTES TITULAIRE",
            "date_naissance":"",
            "date_naissance_timestamp":0,
            "dirigeant":true,
            "raison_sociale":"KARILA AUDIT ET CONSEIL - SOCIETE A RESPONSABILITE LIMITEE",
            "identifiant":"529356198",
            "type":"PM"
         },
         {
            "nom":"",
            "prenom":"",
            "fonction":"COMMISSAIRE AUX COMPTES SUPPLEANT",
            "date_naissance":"",
            "date_naissance_timestamp":0,
            "dirigeant":true,
            "raison_sociale":"FI ABILITY - SOCIETE A RESPONSABILITE LIMITEE",
            "identifiant":"484880422",
            "type":"PM"
         }
      ],
      "etat_administratif":{
         "value":"A",
         "date_cessation":null
      }
   },
   "etablissement_siege":{
      "siege_social":true,
      "siret":"80337757100036",
      "naf":"5829A",
      "libelle_naf":"Édition de logiciels système et de réseau",
      "date_mise_a_jour":1598346799,
      "tranche_effectif_salarie_etablissement":{
         "de":20,
         "a":49,
         "code":"12",
         "date_reference":"2018",
         "intitule":"20 à 49 salariés"
      },
      "date_creation_etablissement":1519858800,
      "region_implantation":{
         "code":"11",
         "value":"Île-de-France"
      },
      "commune_implantation":{
         "code":"75112",
         "value":"Paris 12e Arrondissement"
      },
      "pays_implantation":{
         "code":"FR",
         "value":"FRANCE"
      },
      "diffusable_commercialement":true,
      "enseigne":null,
      "adresse":{
         "l1":"CAP COLLECTIF",
         "l2":null,
         "l3":null,
         "l4":"25 RUE CLAUDE TILLIER",
         "l5":null,
         "l6":"75012 PARIS 12",
         "l7":"FRANCE",
         "numero_voie":"25",
         "type_voie":"RUE",
         "nom_voie":"CLAUDE TILLIER",
         "complement_adresse":null,
         "code_postal":"75012",
         "localite":"PARIS 12",
         "code_insee_localite":"75112",
         "cedex":null
      },
      "etat_administratif":{
         "value":"A",
         "date_fermeture":null
      }
   },
   "gateway_error":false
}';

        $rcsKbis = '{
          "siren": "418166096",
          "date_immatriculation": "1998-03-27",
          "date_immatriculation_timestamp": 890953200,
          "date_extrait": "21 AVRIL 2017",
          "observations": [
            {
              "date": "2000-02-23",
              "date_timestamp": 951260400,
              "numero": "12197",
              "libelle": " LA SOCIETE NE CONSERVE AUCUNE ACTIVITE A SON ANCIEN SIEGE "
            },
            {
              "date": "2017-07-19",
              "date_timestamp": 951260400,
              "numero": "14127",
              "libelle": "AUGMENTATION DE CAPITAL"
            }
          ]
        };';

        $strToArray = json_decode($str);
        $template = '@CapcoPDF/siretPdf.html.twig';
        if ('kbis' === $messageType) {
            $strToArray = json_decode($rcsKbis);
            $template = '@CapcoPDF/kbisPdf.html.twig';
        }

        return $this->render($template, ['data' => $strToArray]);
    }

    /**
     * Security check to allow only the platform URL.
     */
    private function getSafeRedirectDestinationFromRequest(Request $request): string
    {
        $destination = $request->query->get('_destination');
        $homePageUrl = $this->generateUrl('app_homepage', [], true);

        if (!$destination) {
            return $homePageUrl;
        }

        // Important security check to allow only redirect to an URL of this website.
        if (!str_contains($destination, $homePageUrl)) {
            return $homePageUrl;
        }

        return $destination;
    }
}
