<?php

namespace Capco\AppBundle\Controller\Site;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class EvaluationController extends Controller
{
    /**
     * @Route("/evaluations", name="user_evaluations")
     * @Template("CapcoAppBundle:Evaluation:index.html.twig")
     */
    public function indexAction(Request $request)
    {
        if (!$this->getUser()->isEvaluer()) {
            throw $this->createAccessDeniedException();
        }

        return [];
    }
}
