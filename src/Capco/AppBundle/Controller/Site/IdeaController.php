<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Form\IdeaVoteType;
use Capco\AppBundle\Entity\IdeaComment;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Capco\AppBundle\Event\AbstractVoteChangedEvent;
use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Event\CommentChangedEvent;
use JMS\Serializer\SerializationContext;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

class IdeaController extends Controller
{
    /**
     * @Security("has_role('ROLE_USER')")
     * @Route("/ideas/trashed/{page}", name="app_idea_trashed", requirements={"page" = "\d+"}, defaults={"_feature_flags" = "ideas,idea_trash", "page" = 1} )
     * @Template("CapcoAppBundle:Idea:show_trashed.html.twig")
     *
     * @param $page
     *
     * @return array
     */
    public function showTrashedAction($page)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $serializer = $this->get('jms_serializer');

        $pagination = $this->get('capco.site_parameter.resolver')->getValue('ideas.pagination');

        $trashedIdeasNb = $em->getRepository('CapcoAppBundle:Idea')->countTrashed();
        $props = $serializer->serialize([
            'ideas' => $em->getRepository('CapcoAppBundle:Idea')->getTrashed($pagination, $page),
        ], 'json', SerializationContext::create()->setGroups(['Ideas', 'Themes', 'UsersInfos']));

        //Avoid division by 0 in nbPage calculation
        $nbPage = 1;
        if ($pagination !== null && $pagination !== 0) {
            $nbPage = ceil($trashedIdeasNb / $pagination);
        }

        return [
            'props' => $props,
            'trashedIdeasNb' => $trashedIdeasNb,
            'page' => $page,
            'nbPage' => $nbPage,
        ];
    }

    /**
     * @Route("/ideas/{page}", name="app_idea", requirements={"page" = "\d+"}, defaults={"page" = 1, "_feature_flags" = "ideas"} )
     * @Route("/ideas/filter/{theme}/{sort}/{page}", name="app_idea_search", requirements={"page" = "\d+"}, defaults={"page" = 1, "theme" = "all", "sort" = "date", "_feature_flags" = "ideas"} )
     * @Route("/ideas/filter/{theme}/{sort}/{term}/{page}", name="app_idea_search_term", requirements={"page" = "\d+"}, defaults={"page" = 1, "theme" = "all", "sort" = "date", "_feature_flags" = "ideas"} )
     * @Template("CapcoAppBundle:Idea:index.html.twig")
     * @Cache(smaxage="60", public=true)
     *
     * @param $request
     *
     * @return array
     */
    public function indexAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $serializer = $this->get('jms_serializer');

        $pagination = $this->get('capco.site_parameter.resolver')->getValue('ideas.pagination');

        $count = $em->getRepository('CapcoAppBundle:Idea')->countSearchResults();
        $trashedIdeasNb = $em->getRepository('CapcoAppBundle:Idea')->countTrashed();

        $props = $serializer->serialize([
            'pagination' => $pagination,
            'count' => $count,
            'countTrashed' => $trashedIdeasNb,
            'themes' => $em->getRepository('CapcoAppBundle:Theme')->findAll(),
            'ideas' => $em->getRepository('CapcoAppBundle:Idea')->getSearchResults($pagination, 1, null, null, null, 'last', null),
            'trashUrl' => $this->get('router')->generate('app_idea_trashed', [], true),
            'description' => $this->get('capco.site_parameter.resolver')->getValue('ideas.content.body'),
        ], 'json', SerializationContext::create()->setGroups(['Themes', 'Ideas', 'UsersInfos']));

        return [
            'props' => $props,
        ];
    }

    /**
     * @Route("/ideas/{slug}", name="app_idea_show", defaults={"_feature_flags" = "ideas"})
     * @Template("CapcoAppBundle:Idea:show.html.twig")
     *
     * @param string  $slug
     * @param Request $request
     *
     * @return array
     */
    public function showAction(Request $request, $slug)
    {
        $em = $this->getDoctrine()->getManager();
        $serializer = $this->get('jms_serializer');
        $translator = $this->get('translator');

        $idea = $em->getRepository('CapcoAppBundle:Idea')->getOneJoinUserReports($slug, $this->getUser());

        if (!$idea || false === $idea->canDisplay()) {
            throw $this->createNotFoundException($translator->trans('idea.error.not_found', [], 'CapcoAppBundle'));
        }

        $props = $serializer->serialize([
            'themes' => $em->getRepository('CapcoAppBundle:Theme')->findAll(),
            'idea' => $idea,
            'votes' => $em->getRepository('CapcoAppBundle:IdeaVote')->getVotesForIdea($idea, 6),
        ], 'json', SerializationContext::create()->setGroups(['Themes', 'Ideas', 'IdeaVotes', 'UsersInfos', 'UserMedias']));

        $serializer = $this->get('jms_serializer');

        $props = $serializer->serialize([
            'object' => $idea->getId(),
            'uri' => 'ideas',
        ], 'json', SerializationContext::create());

        return [
            'idea' => $idea,
            'props' => $props,
        ];
    }
}
