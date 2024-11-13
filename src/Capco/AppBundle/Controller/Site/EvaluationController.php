<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\GraphQL\Resolver\Query\QueryViewerCanSeeEvaluationsPageResolver;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class EvaluationController extends Controller
{
    /**
     * @Security("has_role('ROLE_USER')")
     * @Route("/evaluations/project/{projectSlug}", name="user_analysis_project")
     * @Route("/evaluations", name="user_evaluations")
     * @Template("@CapcoApp/Evaluation/index.html.twig")
     */
    public function indexAction(Request $request)
    {
        $viewer = $this->getUser();
        $viewerCanSeeEvaluationsPageResolver = $this->get(
            QueryViewerCanSeeEvaluationsPageResolver::class
        );

        if (!$viewerCanSeeEvaluationsPageResolver->__invoke($viewer)) {
            throw $this->createAccessDeniedException();
        }

        return [];
    }
}
