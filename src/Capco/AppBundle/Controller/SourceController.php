<?php

namespace Capco\AppBundle\Controller;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\SourceVote;
use Capco\AppBundle\Form\SourcesType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Form\Form;
use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Event\AddContributionEvent;

class SourceController extends Controller
{
    /**
     * @Route("/consultations/{consultationSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/sources/add", name="app_new_source")
     *
     * @param $consultationSlug
     * @param $opinionTypeSlug
     * @param $opinionSlug
     * @param $request
     * @Template("CapcoAppBundle:Source:create.html.twig")
     *
     * @return array
     */
    public function createSourceAction($consultationSlug, $opinionTypeSlug, $opinionSlug, Request $request)
    {
        if (!$this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', array(), 'CapcoAppBundle'));
        }

        $opinion = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->getOneBySlug($consultationSlug, $opinionTypeSlug, $opinionSlug);

        if ($opinion == null) {
            throw $this->createNotFoundException($this->get('translator')->trans('opinion.error.not_found', array(), 'CapcoAppBundle'));
        }

        if (false == $opinion->canContribute()) {
            throw new AccessDeniedException($this->get('translator')->trans('opinion.error.no_contribute', array(), 'CapcoAppBundle'));
        }

        $opinionType = $opinion->getOpinionType();
        $consultation = $opinion->getConsultation();

        $source = new Source();
        $source->setAuthor($this->getUser());

        $form = $this->createForm(new SourcesType(), $source);

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $source->setOpinion($opinion);
                $em = $this->getDoctrine()->getManager();
                $em->persist($source);
                $em->flush();

                $this->get('event_dispatcher')->dispatch(
                        CapcoAppBundleEvents::AFTER_CONTRIBUTION_ADDED,
                        new AddContributionEvent($this->getUser())
                );

                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('source.create.success'));

                return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultationSlug' => $consultation->getSlug(), 'opinionTypeSlug' => $opinionType->getSlug(), 'opinionSlug' => $opinion->getSlug()]).'#source'.$source->getId());
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('source.create.error'));
            }
        }

        return [
            'consultation' => $opinion->getConsultation(),
            'opinionType' => $opinion->getOpinionType(),
            'opinion' => $opinion,
            'form' => $form->createView(),
            'buttonActive' => $form->get('type')->getData(),
        ];
    }

    /**
     * @Route("/consultations/{consultationSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/sources/{sourceSlug}/delete", name="app_delete_source")
     *
     * @param consultationSlug
     * @param $opinionTypeSlug
     * @param $opinionSlug
     * @param $sourceSlug
     * @param $request
     * @Template("CapcoAppBundle:Source:delete.html.twig")
     *
     * @return array
     */
    public function deleteSourceAction($consultationSlug, $opinionTypeSlug, $opinionSlug, $sourceSlug, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', array(), 'CapcoAppBundle'));
        }

        $source = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->getOneBySlug($consultationSlug, $opinionTypeSlug, $opinionSlug, $sourceSlug);

        if (null == $source) {
            throw $this->createNotFoundException($this->get('translator')->trans('source.error.not_found', array(), 'CapcoAppBundle'));
        }

        if (false == $source->canContribute()) {
            throw new AccessDeniedException($this->get('translator')->trans('source.error.no_contribute', array(), 'CapcoAppBundle'));
        }

        $opinion = $source->getOpinion();
        $opinionType = $opinion->getOpinionType();
        $consultation = $opinion->getConsultation();

        $userCurrent = $this->getUser()->getId();
        $userPostSource = $source->getAuthor()->getId();

        if ($userCurrent !== $userPostSource) {
            throw new AccessDeniedException($this->get('translator')->trans('source.error.not_author', array(), 'CapcoAppBundle'));
        }

        //Champ CSRF
        $form = $this->createFormBuilder()->getForm();

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $em->remove($source);
                $em->flush();

                $this->get('session')->getFlashBag()->add('info', $this->get('translator')->trans('source.delete.success'));

                return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultationSlug' => $consultation->getSlug(), 'opinionTypeSlug' => $opinionType->getSlug(), 'opinionSlug' => $opinion->getSlug()]));
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('source.delete.error'));
            }
        }

        return array(
            'consultation' => $consultation,
            'opinionType' => $opinionType,
            'opinion' => $opinion,
            'source' => $source,
            'form' => $form->createView(),
        );
    }

    /**
     * @Route("/consultations/{consultationSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/sources/{sourceSlug}/edit", name="app_edit_source")
     * @Template("CapcoAppBundle:Source:update.html.twig")
     *
     * @param consultationSlug
     * @param $opinionTypeSlug
     * @param $opinionSlug
     * @param $sourceSlug
     * @param $request
     *
     * @return array
     */
    public function updateSourceAction($consultationSlug, $opinionTypeSlug, $opinionSlug, $sourceSlug, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', array(), 'CapcoAppBundle'));
        }

        $source = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->getOneBySlug($consultationSlug, $opinionTypeSlug, $opinionSlug, $sourceSlug);

        if ($source == null) {
            throw $this->createNotFoundException($this->get('translator')->trans('source.error.not_found', array(), 'CapcoAppBundle'));
        }

        if (false == $source->canContribute()) {
            throw new AccessDeniedException($this->get('translator')->trans('source.error.no_contribute', array(), 'CapcoAppBundle'));
        }

        $opinion = $source->getOpinion();
        $opinionType = $opinion->getOpinionType();
        $consultation = $opinion->getConsultation();

        $userCurrent = $this->getUser()->getId();
        $userPostSource = $source->getAuthor()->getId();

        if ($userCurrent !== $userPostSource) {
            throw new AccessDeniedException($this->get('translator')->trans('source.error.not_author', array(), 'CapcoAppBundle'));
        }

        $form = $this->createForm(new SourcesType(), $source);
        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $type = $form->get('type')->getData();
                $em = $this->getDoctrine()->getManager();

                $source->resetVotes();

                if ($type === 0) {
                    $source->setMedia(null);
                    $mediaManager = $this->container->get('sonata.media.manager.media');
                    $media = $mediaManager->findOneBy(array('id' => $source->getMedia()));
                    if (null != $media) {
                        $provider = $this->get($media->getProviderName());
                        $provider->removeThumbnails($media);
                        $mediaManager->delete($media);
                    }
                }
                if ($type === 1) {
                    $source->setLink(null);
                }
                $em->persist($source);
                $em->flush();

                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('source.update.success'));

                return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultationSlug' => $consultation->getSlug(), 'opinionTypeSlug' => $opinionType->getSlug(), 'opinionSlug' => $opinion->getSlug()]).'#source'.$source->getId());
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('source.update.error'));
            }
        }

        return [
            'consultation' => $consultation,
            'opinionType' => $opinionType,
            'opinion' => $opinion,
            'source' => $source,
            'form' => $form->createView(),
            'buttonActive' => $form->get('type')->getData(),
        ];
    }

    /**
     * @Route("/secure/consultations/{consultationSlug}/opinions/{opinionTypeSlug}/{opinionSlug}/sources/{sourceSlug}/vote", name="app_consultation_vote_source")
     *
     * @param consultationSlug
     * @param $opinionTypeSlug
     * @param $opinionSlug
     * @param $sourceSlug
     * @param $request
     *
     * @return array
     */
    public function voteOnSourceAction($consultationSlug, $opinionTypeSlug, $opinionSlug, $sourceSlug, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', array(), 'CapcoAppBundle'));
        }

        $source = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->getOneBySlug($consultationSlug, $opinionTypeSlug, $opinionSlug, $sourceSlug);

        if ($source == null) {
            throw $this->createNotFoundException($this->get('translator')->trans('source.error.not_found', array(), 'CapcoAppBundle'));
        }

        if (false == $source->canContribute()) {
            throw new AccessDeniedException($this->get('translator')->trans('source.error.no_contribute', array(), 'CapcoAppBundle'));
        }

        $opinion = $source->getOpinion();
        $opinionType = $opinion->getOpinionType();
        $consultation = $opinion->getConsultation();

        $user = $this->getUser();

        if ($request->getMethod() == 'POST') {
            if ($this->isCsrfTokenValid('source_vote', $request->get('_csrf_token'))) {
                $em = $this->getDoctrine()->getManager();

                $sourceVote = new SourceVote();
                $sourceVote->setUser($user);

                $userVote = $em->getRepository('CapcoAppBundle:SourceVote')->findOneBy(array(
                    'user' => $user,
                    'source' => $source,
                ));

                if ($userVote != null) {
                    $sourceVote = $userVote;
                }

                if ($userVote == null) {
                    $sourceVote->setSource($source);
                    $em->persist($sourceVote);
                    $em->flush();

                    $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('source.vote.add_success'));
                } else {
                    $em->remove($sourceVote);
                    $em->flush();

                    $this->get('session')->getFlashBag()->add('info', $this->get('translator')->trans('source.vote.remove_success'));
                }
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('source.vote.csrf_error'));
            }
        }

        return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultationSlug' => $consultation->getSlug(), 'opinionTypeSlug' => $opinionType->getSlug(), 'opinionSlug' => $opinion->getSlug()]));
    }
}
