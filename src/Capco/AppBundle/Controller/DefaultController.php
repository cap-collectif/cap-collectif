<?php

namespace Capco\AppBundle\Controller;

use Capco\AppBundle\Entity\Media;
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
    }

    /**
     * @Cache(expires="+1 minutes", maxage="60", smaxage="0", public="false")
     * @Template()
     */
    public function headerAction($max = 4, $offset = 0)
    {
    }
}
