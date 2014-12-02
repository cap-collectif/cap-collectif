<?php

namespace Capco\AppBundle\Controller;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Menu;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class DefaultController extends Controller
{
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
    public function headerAction($max = 4, $offset = 0)
    {
    }
}
