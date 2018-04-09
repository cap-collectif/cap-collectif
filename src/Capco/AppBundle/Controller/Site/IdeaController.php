<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Idea;
use Doctrine\Common\Collections\ArrayCollection;
use JMS\Serializer\SerializationContext;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

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
        ], 'json', SerializationContext::create()->setGroups(['Ideas', 'ThemeDetails', 'UsersInfos']));

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
        ], 'json', SerializationContext::create()->setGroups(['ThemeDetails', 'Ideas', 'UsersInfos']));

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

        if (!$idea || !$idea->canDisplay()) {
            throw $this->createNotFoundException($translator->trans('idea.error.not_found', [], 'CapcoAppBundle'));
        }

        $previewedVotes = $em->getRepository('CapcoAppBundle:IdeaVote')->getVotesForIdea($idea, 8);
        $idea->setVotes(new ArrayCollection($previewedVotes));

        $props = $serializer->serialize(
          $idea,
          'json',
          SerializationContext::create()->setSerializeNull(true)->setGroups([
              'Ideas', 'ThemeDetails', 'UsersInfos', 'UserMedias',
          ])
        );

        return [
            'idea' => $idea,
            'props' => json_decode($props, true),
        ];
    }
}
