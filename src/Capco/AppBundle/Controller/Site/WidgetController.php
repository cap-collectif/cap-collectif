<?php

namespace Capco\AppBundle\Controller\Site;

use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class WidgetController extends Controller
{
    /**
     * @Route("/widget_debate/{debateId}", name="widget_debate", options={"i18n" = false})
     * @Template("CapcoAppBundle:Widget:widget_debate.html.twig")
     */
    public function widgetDebateAction(string $debateId)
    {
        return [
            'debateId' => $debateId,
        ];
    }
}
