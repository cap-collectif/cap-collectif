<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Form\ContactType;
use Capco\AppBundle\SiteParameter\Resolver;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class DefaultController extends Controller
{
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
     * @Route("/confidentialite", name="app_confidentialite")
     * @Template("CapcoAppBundle:Default:confidentialite.html.twig")
     */
    public function confidentialiteAction(Request $request)
    {
        return [];
    }

    /**
     * @Route("/get_api_token", name="app_get_api_token")
     */
    public function getTokenAction()
    {
        if (!$this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            return new JsonResponse(['message' => 'You are not authenticated.'], 200);
        }

        $user = $this->getUser();
        $token = $this->get('lexik_jwt_authentication.jwt_manager')->create($user);

        return new JsonResponse(['token' => $token]);
    }
}
