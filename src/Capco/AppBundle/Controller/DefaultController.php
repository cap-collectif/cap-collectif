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

                $adminEmail = $this->get('capco.site_parameter.resolver')->getValue('admin.mail.contact');
                if (null == $adminEmail) {
                    $this->get('session')->getFlashBag()->add('danger', 'contact.email.sent_error');
                    return $this->redirect($this->generateUrl('app_homepage'));
                }

                $subject = $this->get('translator')->trans('contact.email.subject', array('%sitename%' => $this->get('capco.site_parameter.resolver')->getValue('global.site.fullname')), 'CapcoAppBundle');

                $this->get('capco.email_sender')->send($adminEmail, $subject, $data["message"], $data["email"], $data["name"], $data["email"]);
                $this->get('session')->getFlashBag()->add('success', 'contact.email.sent_success');

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
            $footerLinks = $this->getDoctrine()->getRepository('CapcoAppBundle:MenuItem')->getParentItems($footerMenu);
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
    public function navigationAction($pathInfo = null)
    {
        $headerMenu = $this->getDoctrine()->getRepository('CapcoAppBundle:Menu')->findIdForType(Menu::TYPE_HEADER);

        if (null !== $headerMenu) {
            $headerLinks = $this->getDoctrine()->getRepository('CapcoAppBundle:MenuItem')->getParentsItemsWithChildrenItems($headerMenu);
        } else {
            $headerLinks = array();
        }

        return [
            'pathInfo' => $pathInfo,
            'headerLinks' => $headerLinks
        ];
    }
}
