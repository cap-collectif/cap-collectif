<?php

namespace Capco\AppBundle\Controller\Site;

use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Capco\AppBundle\Toggle\Manager;

/**
 * @deprecated this is our legacy evaluation tool
 */
class EvaluationController extends Controller
{
    /**
     * @Security("has_role('ROLE_USER')")
     * @Route("/evaluations/project/{projectSlug}", name="user_analysis_project")
     * @Route("/evaluations", name="user_evaluations")
     * @Template("CapcoAppBundle:Evaluation:index.html.twig")
     */
    public function indexAction(Request $request)
    {
        $viewer = $this->getUser();
        $toggleManager = $this->get(Manager::class);

        if ($toggleManager->isActive('unstable__analysis')) {

            // TODO, right now everyone can access this page.
            return [];
        }

        if (!$viewer->isEvaluer()) {
            throw $this->createAccessDeniedException();
        }

        return [];
    }
}
