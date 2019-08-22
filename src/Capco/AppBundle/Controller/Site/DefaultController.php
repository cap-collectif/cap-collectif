<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\GraphQL\Resolver\Event\EventUrlResolver;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class DefaultController extends Controller
{
    /**
     * @Route("/login_check", name="login_check")
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
     * @Route("/login-saml", name="saml_login")
     */
    public function loginSamlAction(Request $request)
    {
        $destination = $request->query->get('_destination') ?? $this->generateUrl('app_homepage');

        return $this->redirect($destination);
    }

    /**
     * @Route("/login-paris", name="paris_login")
     */
    public function loginParisAction(Request $request)
    {
        $destination = $request->query->get('_destination') ?? $this->generateUrl('app_homepage');

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
        $cookiesList = $this->get(SiteParameterRepository::class)->findOneBy([
            'keyname' => 'cookies-list',
            'isEnabled' => 1
        ]);

        if (!$cookiesList) {
            return $this->createNotFoundException();
        }

        return [
            'cookiesList' => html_entity_decode($cookiesList->getValue())
        ];
    }

    /**
     * @Route("/privacy", name="app_privacy")
     * @Template("CapcoAppBundle:Default:privacyPolicy.html.twig")
     */
    public function privacyPolicyAction(Request $request)
    {
        $policy = $this->get(SiteParameterRepository::class)->findOneBy([
            'keyname' => 'privacy-policy',
            'isEnabled' => 1
        ]);

        if (!$policy) {
            return $this->createNotFoundException();
        }

        return [
            'privacy' => html_entity_decode($policy->getValue())
        ];
    }

    /**
     * @Route("/legal", name="app_legal")
     * @Template("CapcoAppBundle:Default:legalMentions.html.twig")
     */
    public function legalMentionsAction(Request $request)
    {
        $legal = $this->get(SiteParameterRepository::class)->findOneBy([
            'keyname' => 'legal-mentions',
            'isEnabled' => 1
        ]);

        if (!$legal) {
            return $this->createNotFoundException();
        }

        return [
            'legal' => html_entity_decode($legal->getValue())
        ];
    }

    /**
     * @Route("/email", name="app_email")
     * @Template("@CapcoMail/notifyAdminOfNewEvent.html.twig")
     * @Security("has_role('ROLE_SUPER_ADMIN')")
     */
    public function emailAction(Request $request)
    {
        $admins = $this->get(UserRepository::class)->getAllAdmin();
        $event = $this->get(EventRepository::class)->find('event1');
        /** @var User $admin */
        foreach ($admins as $admin) {
            return [
                'eventAdminUrl' => $this->get(EventUrlResolver::class)->__invoke($event, true),
                'username' => $admin->getDisplayName(),
                'siteName' => 'Cap collectif',
                'baseUrl' => 'http://capco.dev',
                'eventTitle' => $event->getTitle()
            ];
        }
    }
}
