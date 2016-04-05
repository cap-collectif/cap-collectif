<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Form\ContactType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use JMS\Serializer\SerializationContext;

class DefaultController extends Controller
{
    /**
     * @Route("/contact", name="app_contact")
     * @Template("CapcoAppBundle:Default:contact.html.twig")
     */
    public function contactAction(Request $request)
    {
        $form = $this->createForm(new ContactType());
        $translator = $this->get('translator');

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $data = $form->getData();

                $adminEmail = $this->get('capco.site_parameter.resolver')->getValue('admin.mail.contact');
                if (null == $adminEmail) {
                    $this->get('session')->getFlashBag()->add('danger', 'contact.email.sent_error');

                    return $this->redirect($this->generateUrl('app_homepage'));
                }

                $subject = $this->get('translator')->trans('contact.email.subject', ['%sitename%' => $this->get('capco.site_parameter.resolver')->getValue('global.site.fullname'), '%sender%' => $data['name']], 'CapcoAppBundle');

                $message = \Swift_Message::newInstance()
                    ->setTo($adminEmail)
                    ->setSubject($subject)
                    ->setBody($data['message'])
                    ->setFrom($data['email'])
                    ->setReplyTo($data['email'])
                ;
                $this->get('swiftmailer.mailer.service')->send($message);
                $this->get('session')->getFlashBag()->add('success', 'contact.email.sent_success');

                return $this->redirect($this->generateUrl('app_homepage'));
            }
        }

        return [
            'form' => $form->createView(),
        ];
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
     * @Cache(expires="+1 minutes", maxage="60", smaxage="0", public="false")
     * @Template("CapcoAppBundle:Default:footer.html.twig")
     */
    public function footerAction($max = 4, $offset = 0)
    {
        $footerLinks = $this->getDoctrine()->getRepository('CapcoAppBundle:MenuItem')->getParentItems(MenuItem::TYPE_FOOTER);

        $socialNetworks = $this->getDoctrine()->getRepository('CapcoAppBundle:FooterSocialNetwork')->getEnabled();

        return [
            'socialNetworks' => $socialNetworks,
            'footerLinks' => $footerLinks,
        ];
    }

    /**
     * @Cache(expires="+1 minutes", maxage="60", smaxage="0", public="false")
     * @Template("CapcoAppBundle:Default:navigation.html.twig")
     */
    public function navigationAction($pathInfo = null)
    {
        $headerLinks = $this->get('capco.menu_item.resolver')->getEnabledMenuItemsWithChildren(MenuItem::TYPE_HEADER);

        $user = $this->getUser()
            ? [
                'username' => $this->getUser()->getUsername(),
                'isAdmin' => $this->getUser()->isAdmin(),
              ]
            : null
        ;
        $props = [
          'user' => $user
        ];

        return [
            'props' => $props,
            'pathInfo' => $pathInfo,
            'headerLinks' => $headerLinks,
        ];
    }

    /**
     * @Route("/get_api_token", name="app_get_api_token")
     */
    public function getTokenAction()
    {
        if (!$this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            return new JsonResponse([
              'error' => 'You are not authenticated.'
            ], 401);
        }

        $user = $this->getUser();
        $token = $this->get('lexik_jwt_authentication.jwt_manager')
                      ->create($user);

        $json = $this->get('jms_serializer')->serialize(
            $user,
            'json',
            SerializationContext::create()->setGroups(['Default', 'Users', 'UsersInfos'])
        );

        return new JsonResponse([
            'token' => $token,
            'user' => $json,
        ]);
    }
}
