<?php

namespace Capco\AppBundle\Controller;

use Capco\AppBundle\Form\ContactType;
use Capco\MediaBundle\Entity\Media;
use Capco\AppBundle\Entity\Menu;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;

class DefaultController extends Controller
{
    /**
     * @Route("/contact", name="app_contact")
     * @Template()
     */
    public function contactAction(Request $request)
    {
        $form = $this->createForm(new ContactType());
        $translator = $this->get('translator');

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $data = $form->getData();

                $message = \Swift_Message::newInstance()
                    ->setSubject('Contact via le site')
                    ->setFrom($data["email"])
                    ->setReplyTo($data["email"])
                    ->setTo('lbrunet@jolicode.com')
                    ->setBody($data["message"]);

                $this->get('mailer')->send($message);
                $this->get('session')->getFlashBag()->add('success', $translator->trans('Your message has been sended.'));

                return $this->redirect($this->generateUrl('app_homepage'));
            }
        }

        return [
            'form' => $form->createView()
        ];
    }

    /**
     * @Cache(expires="+1 minutes", maxage="60", smaxage="0", public="false")
     * @Template()
     */
    public function footerAction($max = 4, $offset = 0)
    {
        $footerMenu = $this->getDoctrine()->getRepository('CapcoAppBundle:Menu')->findIdForType(Menu::TYPE_FOOTER);

        if (null !== $footerMenu) {
            $footerLinks = $this->getDoctrine()->getRepository('CapcoAppBundle:MenuItem')->getEnabled($footerMenu);
        } else {
            $footerLinks = array();
        }

        $socialNetworks = $this->getDoctrine()->getRepository('CapcoAppBundle:FooterSocialNetwork')->getEnabled();

        return [
            'socialNetworks' => $socialNetworks,
            'footerLinks' => $footerLinks
        ];
    }

    /**
     * @Cache(expires="+1 minutes", maxage="60", smaxage="0", public="false")
     * @Template()
     */
    public function navigationAction()
    {
        $headerMenu = $this->getDoctrine()->getRepository('CapcoAppBundle:Menu')->findIdForType(Menu::TYPE_HEADER);

        if (null !== $headerMenu) {
            $headerLinks = $this->getDoctrine()->getRepository('CapcoAppBundle:MenuItem')->getEnabled($headerMenu);
        } else {
            $headerLinks = array();
        }

        return [
            'headerLinks' => $headerLinks
        ];
    }
}
