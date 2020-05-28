<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Mailer\Message\MessagesList;
use Capco\AppBundle\Toggle\Manager;
use Doctrine\ORM\NoResultException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
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
            $this->get('security.token_storage')->setToken();

            if ($request->getSession()) {
                $request->getSession()->invalidate();
            }

            return $this->json([
                'success' => false,
                'reason' => 'please-confirm-your-email-address-to-login'
            ]);
        }

        if (!$this->getUser()) {
            return $this->json([
                'success' => false
            ]);
        }

        return $this->json([
            'success' => true
        ]);
    }

    /**
     * @Route("/login-saml", name="saml_login", options={"i18n" = false})
     */
    public function loginSamlAction(Request $request)
    {
        $destination = $request->query->get('_destination') ?? $this->generateUrl('app_homepage', ['_locale' => $request->getLocale()]);

        return $this->redirect($destination);
    }

    /**
     * @Route("/login-paris", name="paris_login", options={"i18n" = false})
     */
    public function loginParisAction(Request $request)
    {
        $destination = $request->query->get('_destination') ?? $this->generateUrl('app_homepage', ['_locale' => $request->getLocale()]);

        return $this->redirect($destination);
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
            $cookiesList = $this->get(SiteParameterRepository::class)->getValue('cookies-list', $request->getLocale());
        } catch (NoResultException $exception) {
            return $this->createNotFoundException();
        }

        return [
            'cookiesList' => html_entity_decode($cookiesList)
        ];
    }

    /**
     * @Route("/privacy", name="app_privacy")
     * @Template("CapcoAppBundle:Default:privacyPolicy.html.twig")
     */
    public function privacyPolicyAction(Request $request)
    {
        try {
            $policy = $this->get(SiteParameterRepository::class)->getValue('privacy-policy', $request->getLocale());
        } catch (NoResultException $exception) {
            return $this->createNotFoundException();
        }

        return [
            'privacy' => html_entity_decode($policy)
        ];
    }

    /**
     * @Route("/legal", name="app_legal")
     * @Template("CapcoAppBundle:Default:legalMentions.html.twig")
     */
    public function legalMentionsAction(Request $request)
    {
        try {
            $legal = $this->get(SiteParameterRepository::class)->getValue('legal-mentions', $request->getLocale());
        } catch (NoResultException $exception) {
            return $this->createNotFoundException();
        }

        return [
            'legal' => html_entity_decode($legal)
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
            $data = $messager::mockData(
                $this->container,
                MessagesList::TEMPLATE_LIST[$messageType]
            );

            return $this->render($data['template'], $data);
        }

        throw new NotFoundHttpException("${messageType} message doesnt exist");
    }
}
