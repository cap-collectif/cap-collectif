<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Entity\AbstractStep;
use Capco\AppBundle\Entity\ConsultationStep;
use Capco\AppBundle\Form\ConsultationSearchType;
use Capco\AppBundle\Form\OpinionsSortType;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\HttpFoundation\Response;

class ConsultationController extends Controller
{
    /**
     * @Cache(expires="+1 minutes", maxage="60", smaxage="60", public="true")
     * @Template("CapcoAppBundle:Consultation:lastConsultations.html.twig")
     *
     * @param $max
     * @param $offset
     *
     * @return array
     */
    public function lastConsultationsAction($max = 4, $offset = 0)
    {
        $consultations = $this->getDoctrine()->getRepository('CapcoAppBundle:Consultation')->getLastPublished($max, $offset);

        return [
            'consultations' => $consultations,
        ];
    }

    // Page consultation

    /**
     * @Route("/consultations/{consultationSlug}/consultation/{stepSlug}", name="app_consultation_show")
     * @Template("CapcoAppBundle:Consultation:show.html.twig")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultationSlug": "slug"}, "method"="getOne"})
     * @ParamConverter("currentStep", class="CapcoAppBundle:ConsultationStep", options={"mapping": {"stepSlug": "slug"}, "method"="getOne"})
     *
     * @param Request          $request
     * @param Consultation     $consultation
     * @param ConsultationStep $currentStep
     *
     * @return array
     */
    public function showAction(Request $request, Consultation $consultation, ConsultationStep $currentStep)
    {
        $em = $this->getDoctrine()->getManager();

        if (false === $currentStep->canDisplay()) {
            throw $this->createNotFoundException($this->get('translator')->trans('consultation.error.not_found', [], 'CapcoAppBundle'));
        }

        if ('POST' === $request->getMethod() && $request->request->has('capco_app_opinions_sort')) {
            $data = $request->request->get('capco_app_opinions_sort');
            $sort = $data['opinionsSort'];
            $opinionTypeSlug = $data['opinionType'];

            if (null != $sort && null != $opinionTypeSlug) {
                return $this->redirect($this->generateUrl('app_consultation_show_opinions_sorted', array(
                    'consultationSlug' => $consultation->getSlug(),
                    'stepSlug' => $currentStep->getSlug(),
                    'opinionTypeSlug' => $opinionTypeSlug,
                    'opinionsSort' => $sort,
                )));
            }
        }

        $nav = $this->get('capco.opinion_types.resolver')->getNavForStep($currentStep);

        return [
            'consultation' => $consultation,
            'currentStep' => $currentStep,
            'nav' => $nav,
        ];
    }

    /**
     * @Template("CapcoAppBundle:Consultation:show_opinions.html.twig")
     *
     * @param $consultation
     * @param $currentStep
     *
     * @return array
     */
    public function showOpinionsAction(Consultation $consultation, ConsultationStep $currentStep)
    {
        $tree = $this->get('capco.opinion_types.resolver')
            ->getGroupedOpinionsForStep($currentStep);

        $addForm = function ($tree) use (&$addForm) {
            $childrenTree = [];
            foreach ($tree as $node) {
                $form = $this->createForm(new OpinionsSortType($node));
                $node['sortForm'] = $form->createView();
                if (count($node['children']) > 0) {
                    $node['children'] = $addForm($node['children']);
                }
                $childrenTree[] = $node;
            }

            return $childrenTree;
        };

        $tree = $addForm($tree);

        return [
            'blocks' => $tree,
            'consultation' => $consultation,
            'currentStep' => $currentStep,
        ];
    }

    /**
     * @Route("/consultations/{consultationSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{page}", name="app_consultation_show_opinions", requirements={"page" = "\d+"}, defaults={"page" = 1})
     * @Route("/consultations/{consultationSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/{opinionsSort}/{page}", name="app_consultation_show_opinions_sorted", requirements={"page" = "\d+","opinionsSort" = "last|old|comments|favorable|votes|positions"}, defaults={"page" = 1})
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultationSlug": "slug"}})
     * @ParamConverter("currentStep", class="CapcoAppBundle:ConsultationStep", options={"mapping": {"stepSlug": "slug"}})
     * @ParamConverter("opinionType", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinionTypeSlug": "slug"}})
     * @Template("CapcoAppBundle:Consultation:show_by_type.html.twig")
     *
     * @param Consultation     $consultation
     * @param ConsultationStep $currentStep
     * @param OpinionType      $opinionType
     * @param $page
     * @param Request          $request
     * @param $opinionsSort
     *
     * @return array
     */
    public function showByTypeAction(Consultation $consultation, ConsultationStep $currentStep, OpinionType $opinionType, $page, Request $request, $opinionsSort = null)
    {
        if (false == $currentStep->canDisplay()) {
            throw $this->createNotFoundException($this->get('translator')->trans('consultation.error.not_found', [], 'CapcoAppBundle'));
        }

        $opinionTypesResolver = $this->get('capco.opinion_types.resolver');

        $allowedTypes = $this->get('capco.opinion_types.resolver')
            ->getHierarchyForConsultationType($currentStep->getConsultationType());

        if (false == $opinionTypesResolver->stepAllowType($currentStep, $opinionType)) {
            throw new NotFoundHttpException('This type does not exist for this consultation');
        }

        $filter = $opinionsSort ? $opinionsSort : $opinionType->getDefaultFilter();
        $sortData = ['slug' => $opinionType->getSlug(), 'defaultFilter' => $filter];
        $form = $this->createForm(new OpinionsSortType($sortData));

        if ('POST' === $request->getMethod()) {
            $form->handleRequest($request);
            if ($form->isValid()) {
                $data = $form->getData();

                return $this->redirect($this->generateUrl('app_consultation_show_opinions_sorted', array(
                    'consultationSlug' => $consultation->getSlug(),
                    'stepSlug' => $currentStep->getSlug(),
                    'opinionTypeSlug' => $opinionType->getSlug(),
                    'opinionsSort' => $data['opinionsSort'],
                )));
            }
        } else {
            $form->setData(array(
                'opinionsSort' => $filter,
            ));
        }

        $currentUrl = $this->generateUrl('app_consultation_show_opinions', ['consultationSlug' => $consultation->getSlug(), 'stepSlug' => $currentStep->getSlug(), 'opinionTypeSlug' => $opinionType->getSlug(), 'page' => $page]);
        $opinions = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->getByOpinionTypeAndConsultationStepOrdered($currentStep, $opinionType->getId(), 10, $page, $filter);
        $nav = $this->get('capco.opinion_types.resolver')->getNavForStep($currentStep);

        return [
            'currentUrl' => $currentUrl,
            'consultation' => $consultation,
            'opinionType' => $opinionType,
            'opinions' => $opinions,
            'page' => $page,
            'nbPage' => ceil(count($opinions) / 10),
            'sortOpinionsForm' => $form->createView(),
            'opinionsSort' => $filter,
            'currentStep' => $currentStep,
            'allowedTypes' => $allowedTypes,
            'nav' => $nav,
        ];
    }

    /**
     * @Route("/consultations/{consultationSlug}/trashed", name="app_consultation_show_trashed", defaults={"_feature_flags" = "consultation_trash"} )
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultationSlug": "slug"}})
     * @Template("CapcoAppBundle:Consultation:show_trashed.html.twig")
     *
     * @param Consultation     $consultation
     * @param ConsultationStep $currentStep
     *
     * @return array
     */
    public function showTrashedAction(Consultation $consultation)
    {
        if (false == $consultation->canDisplay()) {
            throw $this->createNotFoundException($this->get('translator')->trans('consultation.error.not_found', [], 'CapcoAppBundle'));
        }

        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', [], 'CapcoAppBundle'));
        }

        $opinions = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->getTrashedByConsultation($consultation);
        $arguments = $this->getDoctrine()->getRepository('CapcoAppBundle:Argument')->getTrashedByConsultation($consultation);
        $sources = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->getTrashedByConsultation($consultation);

        return [
            'consultation' => $consultation,
            'opinions' => $opinions,
            'arguments' => $arguments,
            'sources' => $sources,
            'argumentsLabels' => Argument::$argumentTypesLabels,
        ];
    }

    /**
     * @Route("/consultations/{consultationSlug}/consultation/{stepSlug}/download/{format}", name="app_consultation_download")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultationSlug": "slug"}})
     * @ParamConverter("step", class="CapcoAppBundle:ConsultationStep", options={"mapping": {"stepSlug": "slug"}})
     *
     * @param Consultation     $consultation
     * @param ConsultationStep $step
     * @param $format
     *
     * @return Response $response
     */
    public function downloadAction($consultation, $step, $format)
    {
        if (!$consultation || !$step) {
            throw $this->createNotFoundException($this->get('translator')->trans('consultation.error.not_found', [], 'CapcoAppBundle'));
        }

        if (!$consultation->isExportable() && !$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')) {
            throw new AccessDeniedException($this->get('translator')->trans('consultation.error.not_exportable', [], 'CapcoAppBundle'));
        }

        $resolver = $this->get('capco.consultation.download.resolver');
        $content = $resolver->getContent($step, $format);

        if (!$content) {
            throw new NotFoundHttpException('Wrong format');
        }

        $response = new Response($content);
        $contentType = $resolver->getContentType($format);
        $filename = $consultation->getSlug().'_'.$step->getSlug().'.'.$format;
        $response->headers->set('Content-Type', $contentType);
        $response->headers->set('Content-Disposition', 'attachment;filename='.$filename);

        return $response;
    }

    /**
     * @Route("/consultations/{consultationSlug}/events", name="app_consultation_show_events", defaults={"_feature_flags" = "calendar"})
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultationSlug": "slug"}})
     * @Template("CapcoAppBundle:Consultation:show_events.html.twig")
     *
     * @param $consultation
     *
     * @return array
     */
    public function showEventsAction(Consultation $consultation)
    {
        $groupedEvents = $this->get('capco.event.resolver')->getEventsGroupedByYearAndMonth(null, null, $consultation->getSlug(), null);
        $nbEvents = $this->get('capco.event.resolver')->countEvents(null, null, $consultation->getSlug(), null);

        return [
            'consultation' => $consultation,
            'years' => $groupedEvents,
            'nbEvents' => $nbEvents,
        ];
    }

    /**
     * @Route("/consultations/{consultationSlug}/posts/{page}", name="app_consultation_show_posts", requirements={"page" = "\d+"}, defaults={"_feature_flags" = "blog", "page" = 1} )
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultationSlug": "slug"}})
     * @Template("CapcoAppBundle:Consultation:show_posts.html.twig")
     *
     * @param $page
     * @param $consultation
     *
     * @return array
     */
    public function showPostsAction(Consultation $consultation, $page)
    {
        $pagination = $this->get('capco.site_parameter.resolver')->getValue('blog.pagination.size');

        $posts = $this->get('capco.blog.post.repository')->getSearchResults(
            $pagination,
            $page,
            null,
            $consultation->getSlug()
        );

        //Avoid division by 0 in nbPage calculation
        $nbPage = 1;
        if ($pagination !== null && $pagination !== 0) {
            $nbPage = ceil(count($posts) / $pagination);
        }

        return [
            'consultation' => $consultation,
            'posts' => $posts,
            'page' => $page,
            'nbPage' => $nbPage,
        ];
    }

    /**
     * @Route("/consultations/{consultationSlug}/participants/{page}", name="app_consultation_show_contributors", requirements={"page" = "\d+"}, defaults={"page" = 1} )
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultationSlug": "slug"}})
     * @Template("CapcoAppBundle:Consultation:show_contributors.html.twig")
     *
     * @param $page
     * @param $consultation
     *
     * @return array
     */
    public function showContributorsAction(Consultation $consultation, $page)
    {
        $pagination = $this->get('capco.site_parameter.resolver')->getValue('contributors.pagination');

        $contributors = $this->get('capco.contribution.resolver')->getConsultationContributorsOrdered($consultation);

        //Avoid division by 0 in nbPage calculation
        $nbPage = 1;
        if ($pagination !== null && $pagination !== 0) {
            $nbPage = ceil(count($contributors) / $pagination);
        }

        return [
            'consultation' => $consultation,
            'contributors' => $contributors,
            'page' => $page,
            'pagination' => $pagination,
            'nbPage' => $nbPage,
        ];
    }

    /**
     * @Template("CapcoAppBundle:Consultation:show_meta.html.twig")
     *
     * @param $consultationSlug
     * @param $currentStepSlug
     *
     * @return array
     */
    public function showMetaAction($consultationSlug, $currentStepSlug)
    {
        $em = $this->getDoctrine();
        $consultation = $em->getRepository('CapcoAppBundle:Consultation')->getOneBySlugWithStepsAndEventsAndPosts($consultationSlug);

        return [
            'consultation' => $consultation,
            'currentStep' => $currentStepSlug,
            'stepStatus' => AbstractStep::$stepStatus,
        ];
    }

    /**
     * @Route("/consultations/{page}", name="app_consultation", requirements={"page" = "\d+"}, defaults={"page" = 1} )
     * @Route("/consultations/{theme}/{sort}/{page}", name="app_consultation_search", requirements={"page" = "\d+"}, defaults={"page" = 1, "theme" = "all"} )
     * @Route("/consultations/{theme}/{sort}/{term}/{page}", name="app_consultation_search_term", requirements={"page" = "\d+"}, defaults={"page" = 1, "theme" = "all"} )
     * @Template("CapcoAppBundle:Consultation:index.html.twig")
     *
     * @param $page
     * @param $request
     * @param $theme
     * @param $sort
     * @param $term
     *
     * @return array
     */
    public function indexAction(Request $request, $page, $theme = null, $sort = null, $term = null)
    {
        $em = $this->getDoctrine()->getManager();
        $currentUrl = $this->generateUrl('app_consultation');
        $toggleManager = $this->get('capco.toggle.manager');
        $themesActivated = $toggleManager->isActive('themes');
        $formActivated = $toggleManager->isActive('consultations_form');

        if ($formActivated) {
            $form = $this->createForm(new ConsultationSearchType($this->get('capco.toggle.manager')), null, array(
                'action' => $currentUrl,
                'method' => 'POST',
            ));
        }

        $themesActivated = $toggleManager->isActive('themes');

        if ($request->getMethod() == 'POST' && $formActivated) {
            $form->handleRequest($request);

            if ($form->isValid()) {
                // redirect to the results page (avoids reload alerts)
                $data = $form->getData();

                return $this->redirect($this->generateUrl('app_consultation_search_term', array(
                    'theme' => ($themesActivated && array_key_exists('theme', $data) && $data['theme']) ? $data['theme']->getSlug() : Theme::FILTER_ALL,
                    'sort' => $data['sort'],
                    'term' => $data['term'],
                )));
            }
        } else {
            if ($formActivated) {
                $form->setData(array(
                    'theme' => $themesActivated ? $em->getRepository('CapcoAppBundle:Theme')->findOneBySlug($theme) : null,
                    'sort' => $sort,
                    'term' => $term,
                ));
            }
        }

        $pagination = $this->get('capco.site_parameter.resolver')->getValue('consultations.pagination');

        $consultations = $em->getRepository('CapcoAppBundle:Consultation')->getSearchResults($pagination, $page, $theme, $sort, $term);

        //Avoid division by 0 in nbPage calculation
        $nbPage = 1;
        if ($pagination !== null && $pagination !== 0) {
            $nbPage = ceil(count($consultations) / $pagination);
        }

        $parameters = [
            'consultations' => $consultations,
            'page' => $page,
            'nbPage' => $nbPage,
        ];

        if ($formActivated) {
            $parameters['form'] = $form->createView();
        }

        return $parameters;
    }
}
