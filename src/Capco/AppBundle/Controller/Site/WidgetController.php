<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Debate\Debate;
use Symfony\Component\Routing\Annotation\Route;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;

class WidgetController extends Controller
{
    private GlobalIdResolver $globalIdResolver;

    public function __construct(GlobalIdResolver $globalIdResolver)
    {
        $this->globalIdResolver = $globalIdResolver;
    }

    /**
     * @Route("/widget_debate/{debateId}", name="widget_debate", options={"i18n" = false})
     * @Template("CapcoAppBundle:Widget:widget_debate.html.twig")
     */
    public function widgetDebateAction(string $debateId)
    {
        $viewer = $this->getUser();
        $debate = $this->globalIdResolver->resolve($debateId, $viewer);
        
        if (!$debate || !($debate instanceof Debate) || !$debate->getStep() || !$debate->getProject()) {
            throw $this->createNotFoundException();
        }

        $step = $debate->getStep();
        $project = $debate->getProject();

        if (!$project->canDisplay($viewer)) {
            throw new ProjectAccessDeniedException();
        }

        return [
            'debateId' => $debateId,
            'step' => $step,
            'project' => $project,
        ];
    }
}
