<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionAppendix;
use Capco\AppBundle\Repository\OpinionTypeRepository;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Doctrine\Common\Collections\ArrayCollection;
use Sonata\AdminBundle\Controller\CRUDController as Controller;
use Sonata\AdminBundle\Exception\LockException;
use Sonata\AdminBundle\Exception\ModelManagerException;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class OpinionController extends Controller
{
    public function listAction(Request $request = null)
    {
        if (false === $this->admin->isGranted('LIST')) {
            throw $this->createAccessDeniedException();
        }

        $preResponse = $this->preList($request);
        if (null !== $preResponse) {
            return $preResponse;
        }

        if (($listMode = $request->get('_list_mode'))) {
            $this->admin->setListMode($listMode);
        }

        $datagrid = $this->admin->getDatagrid();
        $formView = $datagrid->getForm()->createView();

        // set the theme for the current Admin Form
        $this->get('twig')
            ->getExtension('form')
            ->renderer->setTheme($formView, $this->admin->getFilterTheme());

        return $this->render(
            $this->admin->getTemplate('list'),
            [
                'action' => 'list',
                'form' => $formView,
                'datagrid' => $datagrid,
                'csrf_token' => $this->getCsrfToken('sonata.batch'),
                'consultations' => $this->getConsultations(),
            ],
            null,
            $request
        );
    }

    public function createAction(Request $request = null)
    {
        // the key used to lookup the template
        $templateKey = 'edit';

        if (false === $this->admin->isGranted('CREATE')) {
            throw $this->createAccessDeniedException();
        }

        $object = $this->admin->getNewInstance();

        $opinionType = null;

        $opinionTypeId = $request->get('opinion_type');
        if ($opinionTypeId) {
            $opinionType = $this->get(OpinionTypeRepository::class)->find($opinionTypeId);
            if ($opinionType) {
                $object->setOpinionType($opinionType);
                $object = $this->updateAppendicesForOpinion($object);
            }
        }

        if (!$opinionType) {
            return new RedirectResponse($this->admin->generateUrl('list'));
        }

        $this->admin->setSubject($object);

        $preResponse = $this->preCreate($request, $object);
        if (null !== $preResponse) {
            return $preResponse;
        }

        /** @var $form \Symfony\Component\Form\Form */
        $form = $this->admin->getForm();
        $form->setData($object);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $isFormValid = $form->isValid();

            // persist if the form was valid and if in preview mode the preview was approved
            if (
                $isFormValid &&
                (!$this->isInPreviewMode($request) || $this->isPreviewApproved($request))
            ) {
                if (false === $this->admin->isGranted('CREATE', $object)) {
                    throw $this->createAccessDeniedException();
                }

                try {
                    $object = $this->admin->create($object);

                    if ($this->isXmlHttpRequest($request)) {
                        return $this->renderJson(
                            [
                                'result' => 'ok',
                                'objectId' => $this->admin->getNormalizedIdentifier($object),
                            ],
                            200,
                            [],
                            $request
                        );
                    }

                    $this->addFlash(
                        'sonata_flash_success',
                        $this->admin->trans(
                            'flash_create_success',
                            ['%name%' => $this->escapeHtml($this->admin->toString($object))],
                            'CapcoAppBundle'
                        )
                    );

                    // redirect to edit mode
                    return $this->redirectTo($object, $request);
                } catch (ModelManagerException $e) {
                    $this->handleModelManagerException($e);

                    $isFormValid = false;
                }
            }

            // show an error message if the form failed validation
            if (!$isFormValid) {
                if (!$this->isXmlHttpRequest($request)) {
                    $this->addFlash(
                        'sonata_flash_error',
                        $this->admin->trans(
                            'flash_create_error',
                            ['%name%' => $this->escapeHtml($this->admin->toString($object))],
                            'CapcoAppBundle'
                        )
                    );
                }
            } elseif ($this->isPreviewRequested($request)) {
                // pick the preview template if the form was valid and preview was requested
                $templateKey = 'preview';
                $this->admin->getShow();
            }
        }

        $view = $form->createView();

        // set the theme for the current Admin Form
        $this->get('twig')
            ->getExtension('form')
            ->renderer->setTheme($view, $this->admin->getFormTheme());

        return $this->render(
            $this->admin->getTemplate($templateKey),
            [
                'action' => 'create',
                'form' => $view,
                'object' => $object,
                'consultations' => $this->getConsultations(),
            ],
            null,
            $request
        );
    }

    public function editAction($id = null, Request $request = null)
    {
        // the key used to lookup the template
        $templateKey = 'edit';

        $id = $request->get($this->admin->getIdParameter());
        $object = $this->admin->getObject($id);

        if (\is_object($object) && !$object->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }
        if (!$object) {
            throw new NotFoundHttpException(sprintf('unable to find the object with id : %s', $id));
        }

        if (false === $this->admin->isGranted('EDIT', $object)) {
            throw $this->createAccessDeniedException();
        }

        $preResponse = $this->preEdit($request, $object);
        if (null !== $preResponse) {
            return $preResponse;
        }

        $object = $this->updateAppendicesForOpinion($object);

        $this->admin->setSubject($object);

        /** @var $form \Symfony\Component\Form\Form */
        $form = $this->admin->getForm();
        $form->setData($object);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $isFormValid = $form->isValid();

            // persist if the form was valid and if in preview mode the preview was approved
            if (
                $isFormValid &&
                (!$this->isInPreviewMode($request) || $this->isPreviewApproved($request))
            ) {
                try {
                    $object = $this->admin->update($object);

                    if ($this->isXmlHttpRequest($request)) {
                        return $this->renderJson(
                            [
                                'result' => 'ok',
                                'objectId' => $this->admin->getNormalizedIdentifier($object),
                                'objectName' => $this->escapeHtml($this->admin->toString($object)),
                            ],
                            200,
                            [],
                            $request
                        );
                    }

                    $this->addFlash(
                        'sonata_flash_success',
                        $this->admin->trans(
                            'flash_edit_success',
                            ['%name%' => $this->escapeHtml($this->admin->toString($object))],
                            'CapcoAppBundle'
                        )
                    );

                    // redirect to edit mode
                    return $this->redirectTo($object, $request);
                } catch (ModelManagerException $e) {
                    $this->handleModelManagerException($e);

                    $isFormValid = false;
                } catch (LockException $e) {
                    $this->addFlash(
                        'sonata_flash_error',
                        $this->admin->trans(
                            'flash_lock_error',
                            [
                                '%name%' => $this->escapeHtml($this->admin->toString($object)),
                                '%link_start%' =>
                                    '<a href="' .
                                        $this->admin->generateObjectUrl('edit', $object) .
                                        '">',
                                '%link_end%' => '</a>',
                            ],
                            'CapcoAppBundle'
                        )
                    );
                }
            }

            // show an error message if the form failed validation
            if (!$isFormValid) {
                if (!$this->isXmlHttpRequest($request)) {
                    $this->addFlash(
                        'sonata_flash_error',
                        $this->admin->trans(
                            'flash_edit_error',
                            ['%name%' => $this->escapeHtml($this->admin->toString($object))],
                            'CapcoAppBundle'
                        )
                    );
                }
            } elseif ($this->isPreviewRequested($request)) {
                // enable the preview template if the form was valid and preview was requested
                $templateKey = 'preview';
                $this->admin->getShow();
            }
        }

        $view = $form->createView();

        // set the theme for the current Admin Form
        $this->get('twig')
            ->getExtension('form')
            ->renderer->setTheme($view, $this->admin->getFormTheme());

        return $this->render(
            $this->admin->getTemplate($templateKey),
            [
                'action' => 'edit',
                'form' => $view,
                'object' => $object,
                'consultations' => $this->getConsultations(),
            ],
            null,
            $request
        );
    }

    public function showAction($id = null, Request $request = null)
    {
        $id = $request->get($this->admin->getIdParameter());

        $object = $this->admin->getObject($id);

        if (!$object) {
            throw $this->createNotFoundException(
                sprintf('unable to find the object with id : %s', $id)
            );
        }
        if (!$object->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }
        if (false === $this->admin->isGranted('VIEW', $object)) {
            throw $this->createAccessDeniedException();
        }

        $preResponse = $this->preShow($request, $object);
        if (null !== $preResponse) {
            return $preResponse;
        }

        $this->admin->setSubject($object);

        return $this->render(
            $this->admin->getTemplate('show'),
            [
                'action' => 'show',
                'object' => $object,
                'elements' => $this->admin->getShow(),
                'consultations' => $this->getConsultations(),
            ],
            null,
            $request
        );
    }

    public function deleteAction($id, Request $request = null)
    {
        $id = $request->get($this->admin->getIdParameter());
        $object = $this->admin->getObject($id);

        if (!$object) {
            throw new NotFoundHttpException(sprintf('unable to find the object with id : %s', $id));
        }

        if (!$object->canDisplay($this->getUser())) {
            throw new ProjectAccessDeniedException();
        }

        if (false === $this->admin->isGranted('DELETE', $object)) {
            throw $this->createAccessDeniedException();
        }

        $preResponse = $this->preDelete($request, $object);
        if (null !== $preResponse) {
            return $preResponse;
        }

        if ('DELETE' === $this->getRestMethod($request)) {
            // check the csrf token
            $this->validateCsrfToken('sonata.delete', $request);

            $objectName = $this->admin->toString($object);

            try {
                $this->admin->delete($object);

                if ($this->isXmlHttpRequest($request)) {
                    return $this->renderJson(['result' => 'ok'], 200, [], $request);
                }

                $this->addFlash(
                    'sonata_flash_success',
                    $this->admin->trans(
                        'flash_delete_success',
                        ['%name%' => $this->escapeHtml($objectName)],
                        'CapcoAppBundle'
                    )
                );
            } catch (ModelManagerException $e) {
                $this->handleModelManagerException($e);

                if ($this->isXmlHttpRequest($request)) {
                    return $this->renderJson(['result' => 'error'], 200, [], $request);
                }

                $this->addFlash(
                    'sonata_flash_error',
                    $this->admin->trans(
                        'flash_delete_error',
                        ['%name%' => $this->escapeHtml($objectName)],
                        'CapcoAppBundle'
                    )
                );
            }

            return $this->redirectTo($object, $request);
        }

        return $this->render(
            $this->admin->getTemplate('delete'),
            [
                'object' => $object,
                'action' => 'delete',
                'csrf_token' => $this->getCsrfToken('sonata.delete'),
                'consultations' => $this->getConsultations(),
            ],
            null,
            $request
        );
    }

    public function getConsultations()
    {
        $rootOpinionTypes = $this->get(OpinionTypeRepository::class)
            ->createQueryBuilder('ot')
            ->select('ot', 'c')
            ->leftJoin('ot.consultation', 'c')
            ->andWhere('ot.consultation is not null')
            ->andWhere('ot.parent is null')
            ->orderBy('c.id', 'asc')
            ->getQuery()
            ->getArrayResult();
        $otRepo = $this->get(OpinionTypeRepository::class);
        $consultations = [];

        foreach ($rootOpinionTypes as $root) {
            $ct = $root['consultation']['title'];
            $root['__children'] = $otRepo->childrenHierarchy($otRepo->find($root['id']));
            if (isset($consultations[$ct]) && \is_array($consultations[$ct])) {
                $consultations[$ct][] = $root;
            } else {
                $consultations[$ct] = [$root];
            }
        }

        return $consultations;
    }

    public function updateAppendicesForOpinion(Opinion $opinion)
    {
        $appendixTypes = $this->get('doctrine')
            ->getManager()
            ->getRepository('CapcoAppBundle:OpinionTypeAppendixType')
            ->findBy(['opinionType' => $opinion->getOpinionType()], ['position' => 'ASC']);
        $newAppendices = new ArrayCollection();
        $currentAppendices = $opinion->getAppendices();
        foreach ($appendixTypes as $otat) {
            $found = false;
            foreach ($currentAppendices as $capp) {
                if ($capp->getAppendixType() === $otat->getAppendixType()) {
                    $found = true;
                    $newAppendices->add($capp);

                    break;
                }
            }
            if (!$found) {
                $app = new OpinionAppendix();
                $app->setAppendixType($otat->getAppendixType());
                $app->setOpinion($opinion);
                $newAppendices->add($app);
            }
        }
        $opinion->setAppendices(new ArrayCollection());
        foreach ($newAppendices as $app) {
            $opinion->addAppendice($app);
        }

        return $opinion;
    }
}
