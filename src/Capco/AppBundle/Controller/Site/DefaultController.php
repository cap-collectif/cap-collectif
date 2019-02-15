<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Form\ContactType;
use Capco\AppBundle\SiteParameter\Resolver;
use Capco\AppBundle\Toggle\Manager;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

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
            $this->get('security.token_storage')->setToken(null);
            $request->getSession()->invalidate();

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
     * @Template("CapcoAppBundle:Default:contact.html.twig")
     */
    public function contactAction(Request $request)
    {
        $form = $this->createForm(ContactType::class);

        if ('POST' === $request->getMethod()) {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $data = $form->getData();

                // We create a session for flashBag
                $flashBag = $this->get('session')->getFlashBag();

                $adminEmail = $this->get(Resolver::class)->getValue('admin.mail.contact');
                if (null === $adminEmail) {
                    $flashBag->add('danger', 'contact.email.sent_error');

                    return $this->redirect($this->generateUrl('app_homepage'));
                }

                $this->get('capco.contact_notifier')->onContact(
                    $adminEmail,
                    $data['email'],
                    $data['name'],
                    $data['message'],
                    $this->generateUrl('app_homepage')
                );
                $flashBag->add('success', 'contact.email.sent_success');

                return $this->redirect($this->generateUrl('app_homepage'));
            }
        }

        return ['form' => $form->createView()];
    }

    /**
     * @Route("/cookies-page", name="app_cookies")
     * @Template("CapcoAppBundle:Default:cookies.html.twig")
     */
    public function cookiesAction(Request $request)
    {
        $cookiesList = $this->get('capco.site_parameter.repository')->findOneBy([
            'keyname' => 'cookies-list',
            'isEnabled' => 1,
        ]);

        return [
            'cookiesList' => $cookiesList ? $cookiesList->getValue() : '',
        ];
    }
}
