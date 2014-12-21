<?php

namespace Capco\AppBundle\Controller;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Form\ConsultationSearchType;
use Capco\AppBundle\Form\OpinionsType as OpinionForm;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class ConsultationController extends Controller
{

    /**
     * @Route("/consultation/{consultation_slug}/{opinion_type_slug}/add", name="app_consultation_new_opinion")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultation_slug": "slug"}})
     * @ParamConverter("opinionType", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinion_type_slug": "slug"}})
     * @param $opinionType
     * @param $consultation
     * @param $request
     * @Template()
     * @return array
     */
    public function createAction(Consultation $consultation, OpinionType $opinionType, Request $request)
    {

        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        if (false === $opinionType->isIsEnabled()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        $opinion = new Opinion();

        $opinion->setConsultation($consultation);
        $opinion->setAuthor($this->getUser());
        $opinion->setOpinionType($opinionType);
        $opinion->setIsEnabled(true);

        $form = $this->createForm(new OpinionForm(), $opinion);

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {

                $em = $this->getDoctrine()->getManager();
                $em->persist($opinion);
                $em->flush();
                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('Your proposition has been saved'));
                return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultation_slug' => $consultation->getSlug(), 'opinion_type_slug' => $opinionType->getSlug(), 'opinion_slug' => $opinion->getSlug() ]));
            }

        }

        return [
            'consultation' => $consultation,
            'opinionType' => $opinionType,
            'form' => $form->createView()
        ];
    }

    /**
     * @Route("/consultation/{consultation_slug}/{opinion_type_slug}/delete/{opinion_slug}", name="app_consultation_delete_opinion")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultation_slug": "slug"}})
     * @ParamConverter("opinionType", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinion_type_slug": "slug"}})
     * @ParamConverter("opinion", class="CapcoAppBundle:Opinion", options={"mapping": {"opinion_slug": "slug"}})
     * @param $opinionType
     * @param $consultation
     * @param $request
     * @param $opinion
     * @Template()
     * @return array
     */
    public function deleteAction(Consultation $consultation, OpinionType $opinionType, Opinion $opinion, Request $request)
    {

        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        if (false === $opinionType->isIsEnabled()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        $userCurrent = $this->getUser()->getId();
        $userPostOpinion = $opinion->getAuthor()->getId();

        if ($userCurrent !== $userPostOpinion) {
            throw new AccessDeniedException($this->get('translator')->trans('You cannot delete this contribution'));
        }

        //Champ CSRF
        $form = $this->createFormBuilder()->getForm();

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {

                $em = $this->getDoctrine()->getManager();
                $em->remove($opinion);
                $em->flush();
                $this->get('session')->getFlashBag()->add('info', $this->get('translator')->trans('The proposition has been deleted'));

                return $this->redirect($this->generateUrl('app_consultation_show', ['consultation_slug' => $consultation->getSlug() ]));
            }
        }

        return array(
            'opinion' => $opinion,
            'consultation' => $consultation,
            'opinionType' => $opinionType,
            'form' => $form->createView()
        );
    }

    /**
     * @Route("/consultation/{consultation_slug}/{opinion_type_slug}/edit/{opinion_slug}", name="app_consultation_edit_opinion")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultation_slug": "slug"}})
     * @ParamConverter("opinionType", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinion_type_slug": "slug"}})
     * @ParamConverter("opinion", class="CapcoAppBundle:Opinion", options={"mapping": {"opinion_slug": "slug"}})
     * @Template()
     * @param $request
     * @param $consultation
     * @param $opinionType
     * @param $opinion
     * @return array
     */
    public function updateAction(Consultation $consultation, OpinionType $opinionType, Opinion $opinion, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        $userCurrent = $this->getUser()->getId();
        $userPostOpinion = $opinion->getAuthor()->getId();

        if ($userCurrent !== $userPostOpinion) {
            throw new AccessDeniedException($this->get('translator')->trans('You cannot edit this opinion, as you are not its author'));
        }

        $form = $this->createForm(new OpinionForm(), $opinion);
        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $em->persist($opinion);
                $em->flush();

                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('The opinion has been edited'));

                return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultation_slug' => $consultation->getSlug(), 'opinion_type_slug' => $opinionType->getSlug(), 'opinion_slug' => $opinion->getSlug() ]));
            }
        }

        return [
            'form' => $form->createView(),
            'opinion' => $opinion,
            'consultation' => $consultation,
            'opinionType' => $opinionType
        ];
    }

    /**
     * @Route("/consultations/{page}", name="app_consultation", requirements={"page" = "\d+"}, defaults={"page" = 1} )
     * @Route("/consultations/{theme}/{sort}/{page}", name="app_consultation_search", requirements={"page" = "\d+"}, defaults={"page" = 1, "theme" = "all"} )
     * @Route("/consultations/{theme}/{sort}/{term}/{page}", name="app_consultation_search_term", requirements={"page" = "\d+"}, defaults={"page" = 1, "theme" = "all"} )
     * @Template()
     * @param $page
     * @param $request
     * @param $theme
     * @param $sort
     * @param $term
     * @return array
     */
    public function indexAction(Request $request, $page, $theme = null, $sort = null, $term = null)
    {
        $em = $this->getDoctrine()->getManager();
        $currentUrl = $this->generateUrl('app_consultation');

        $form = $this->createForm(new ConsultationSearchType(), null, array(
                'action' => $currentUrl,
                'method' => 'POST'
            ));

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                // redirect to the results page (avoids reload alerts)
                $data = $form->getData();

                return $this->redirect($this->generateUrl('app_consultation_search_term', array(
                            'theme' => $data['theme'] ? $data['theme']->getSlug() : Theme::FILTER_ALL,
                            'sort' => $data['sort'],
                            'term' => $data['term']
                        )));
            }
        } else {
            $form->setData(array(
                    'theme' => $em->getRepository('CapcoAppBundle:Theme')->findOneBySlug($theme),
                    'sort' => $sort,
                    'term' => $term,
                ));
        }

        $consultations = $em->getRepository('CapcoAppBundle:Consultation')->getSearchResultsWithTheme(4, $page, $theme, $sort, $term);

        return [
            'consultations' => $consultations,
            'statuses' => Consultation::$openingStatuses,
            'page' => $page,
            'nbPage' => ceil(count($consultations) / 4),
            'form' => $form->createView()
        ];
    }

    /**
     * @Route("/consultation/{slug}", name="app_consultation_show")
     * @Template()
     * @param Consultation $consultation
     * @return array
     */
    public function showAction(Consultation $consultation)
    {
        $em = $this->getDoctrine()->getManager();
        $consultation = $em->getRepository('CapcoAppBundle:Consultation')->getFirstResultWithMedia($consultation->getSlug());

        return [
            'consultation' => $consultation,
            'statuses' => Theme::$statuses
        ];
    }

    /**
     * @Cache(expires="+1 minutes", maxage="60", smaxage="60", public="true")
     * @Template("CapcoAppBundle:Consultation:lastConsultations.html.twig")
     */
    public function lastOpenConsultationsAction($max = 4, $offset = 0)
    {
        $consultations = $this->getDoctrine()->getRepository('CapcoAppBundle:Consultation')->getLastOpen($max, $offset);

        if (!isset($consultations[0])) {
            return new Response('');
        }

        return [
            'consultations' => $consultations,
            'statuses' => \Capco\AppBundle\Entity\Consultation::$openingStatuses
        ];
    }

    /**
     * @Template()
     * @param $consultation
     * @return array
     */
    public function getOpinionsAction(Consultation $consultation)
    {
        $blocks = $this->getDoctrine()->getRepository('CapcoAppBundle:OpinionType')->findByType($consultation);

        if (!isset($blocks[0])) {
            return new Response('');
        }

        return [ 'blocks' => $blocks ];
    }

    /**
     * @Template()
     * @param $consultation
     * @param $type
     * @return array
     */
    public function getNavOpinionTypeAction(Consultation $consultation, $type)
    {
        $consultationCurrent = $consultation->getSlug();
        $opinionsTypes = $this->getDoctrine()->getRepository('CapcoAppBundle:OpinionType')->findByType($consultation);

        return [
            'opinionsTypes' => $opinionsTypes,
            'opinionTypeCurrent' => $type,
            'consultationCurrent' => $consultationCurrent
        ];
    }

    /**
     * @Route("/consultation/{consultation_slug}/{opinion_type_slug}/{page}", name="app_consultation_show_opinions", requirements={"page" = "\d+"}, defaults={"page" = 1})
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultation_slug": "slug"}})
     * @ParamConverter("opiniontype", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinion_type_slug": "slug"}})
     * @Template("CapcoAppBundle:Consultation:blockOpinions.html.twig")
     * @param Consultation $consultation
     * @param OpinionType $opiniontype
     * @param $page
     * @return array
     */
    public function getOpinionsTypeAction(Consultation $consultation, OpinionType $opiniontype, $page)
    {
        $currentUrl = $this->generateUrl('app_consultation_show_opinions', ['consultation_slug' => $consultation->getSlug(), 'opinion_type_slug' => $opiniontype->getSlug() ]);
        $opinions = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->getOpinionsByOpinionTypeAndConsultation($consultation, $opiniontype, 10, $page);

        return [
            'currentUrl' => $currentUrl,
            'consultation' => $consultation,
            'opinions' => $opinions,
            'page' => $page,
            'nbPage' => ceil(count($opinions) / 10)
        ];
    }

    /**
     * @Route("/consultation/{consultation_slug}/{opinion_type_slug}/{opinion_slug}", name="app_consultation_show_opinion")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultation_slug": "slug"}})
     * @ParamConverter("opiniontype", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinion_type_slug": "slug"}})
     * @ParamConverter("opinion", class="CapcoAppBundle:Opinion", options={"mapping": {"opinion_slug": "slug"}})
     * @Template("CapcoAppBundle:Consultation:opinion.html.twig")
     * @param Consultation $consultation
     * @param OpinionType $opiniontype
     * @param Opinion $opinion
     * @return array
     */
    public function getOpinionAction(Consultation $consultation, OpinionType $opiniontype, Opinion $opinion)
    {
        $currentUrl = $this->generateUrl('app_consultation_show_opinion', ['consultation_slug' => $consultation->getSlug(), 'opinion_type_slug' => $opiniontype->getSlug(), 'opinion_slug' => $opinion->getSlug() ]);
        $opinion = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->getOpinionWithArguments($opinion->getSlug());

        $Votes = $this->getDoctrine()->getRepository('CapcoAppBundle:OpinionVote')->getByOpinion($opinion->getSlug());

        return [
            'currentUrl' => $currentUrl,
            'consultation' => $consultation,
            'opinion' => $opinion,
            'votes' => $Votes
        ];
    }

    /**
     * @Template("CapcoAppBundle:Consultation:arguments.html.twig")
     * @param Opinion $opinion
     * @param $type
     * @return array
     */
    public function getArgumentsByTypeAction(Opinion $opinion, $type)
    {
        if($type === 0){
            $typeArgt = "no";
        } else {
            $typeArgt = "yes";
        }

        $argumentsType = $this->getDoctrine()->getRepository('CapcoAppBundle:Argument')->findBy(
            array('type' => $type, 'opinion' => $opinion)
        );

        return [
            'argumentsType' => $argumentsType,
            'typeArgt' => $typeArgt
        ];
    }

}
