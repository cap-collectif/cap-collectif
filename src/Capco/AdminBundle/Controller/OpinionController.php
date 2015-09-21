<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Entity\OpinionAppendix;
use Capco\AppBundle\Entity\Opinion;
use Doctrine\Common\Collections\ArrayCollection;
use Sonata\AdminBundle\Controller\CRUDController as Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class OpinionController extends Controller
{
    public function listAction(Request $request = null)
    {
        if (false === $this->admin->isGranted('LIST')) {
            throw new AccessDeniedException();
        }

        $preResponse = $this->preList($request);
        if ($preResponse !== null) {
            return $preResponse;
        }

        if ($listMode = $request->get('_list_mode')) {
            $this->admin->setListMode($listMode);
        }

        $datagrid = $this->admin->getDatagrid();
        $formView = $datagrid->getForm()->createView();

        // set the theme for the current Admin Form
        $this->get('twig')->getExtension('form')->renderer->setTheme($formView, $this->admin->getFilterTheme());

        return $this->render(
            $this->admin->getTemplate('list'),
            array(
                'action' => 'list',
                'form' => $formView,
                'datagrid' => $datagrid,
                'csrf_token' => $this->getCsrfToken('sonata.batch'),
                'consultationTypes' => $this->getConsultationTypes(),
            ),
            null,
            $request
        );
    }

    public function createAction(Request $request = null)
    {
        // the key used to lookup the template
        $templateKey = 'edit';

        if (false === $this->admin->isGranted('CREATE')) {
            throw new AccessDeniedException();
        }

        $class = new \ReflectionClass(
            $this->admin->hasActiveSubClass() ? $this->admin->getActiveSubClass() : $this->admin->getClass()
        );

        if ($class->isAbstract()) {
            return $this->render(
                'SonataAdminBundle:CRUD:select_subclass.html.twig',
                array(
                    'base_template' => $this->getBaseTemplate(),
                    'admin' => $this->admin,
                    'action' => 'create',
                ),
                null,
                $request
            );
        }

        $object = $this->admin->getNewInstance();

        $opinionType = null;

        $opinionTypeId = $request->get('opinion_type');
        if ($opinionTypeId) {
            $opinionType = $this->get('doctrine.orm.entity_manager')
                ->getRepository('CapcoAppBundle:OpinionType')
                ->find($opinionTypeId);
            if ($opinionType) {
                $object->setOpinionType($opinionType);
                $object = $this->updateAppendicesForOpinion($object);
            }
        }

        $this->admin->setSubject($object);

        $preResponse = $this->preCreate($request, $object);
        if ($preResponse !== null) {
            return $preResponse;
        }

        /** @var $form \Symfony\Component\Form\Form */
        $form = $this->admin->getForm();
        $form->setData($object);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $isFormValid = $form->isValid();

            // persist if the form was valid and if in preview mode the preview was approved
            if ($isFormValid && (!$this->isInPreviewMode($request) || $this->isPreviewApproved($request))) {
                if (false === $this->admin->isGranted('CREATE', $object)) {
                    throw new AccessDeniedException();
                }

                try {
                    $object = $this->admin->create($object);

                    if ($this->isXmlHttpRequest($request)) {
                        return $this->renderJson(
                            array(
                                'result' => 'ok',
                                'objectId' => $this->admin->getNormalizedIdentifier($object),
                            ),
                            200,
                            array(),
                            $request
                        );
                    }

                    $this->addFlash(
                        'sonata_flash_success',
                        $this->admin->trans(
                            'flash_create_success',
                            array('%name%' => $this->escapeHtml($this->admin->toString($object))),
                            'SonataAdminBundle'
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
                            array('%name%' => $this->escapeHtml($this->admin->toString($object))),
                            'SonataAdminBundle'
                        )
                    );
                }
            } elseif ($this->isPreviewRequested($request)) {
                // pick the preview template if the form was valid and preview was requested
                $templateKey = 'preview';
                $this->admin->getShow();
            }
        } else {
            if (!$opinionType) {
                return new RedirectResponse($this->admin->generateUrl('list'));
            }
        }

        $view = $form->createView();

        // set the theme for the current Admin Form
        $this->get('twig')->getExtension('form')->renderer->setTheme($view, $this->admin->getFormTheme());

        return $this->render(
            $this->admin->getTemplate($templateKey),
            array(
                'action' => 'create',
                'form' => $view,
                'object' => $object,
                'consultationTypes' => $this->getConsultationTypes(),
            ),
            null,
            $request
        );
    }

    public function editAction($id = null, Request $request = null)
    {
        $opinionTypes = $this->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:OpinionType')
            ->findAll();

        // the key used to lookup the template
        $templateKey = 'edit';

        $id = $request->get($this->admin->getIdParameter());
        $object = $this->admin->getObject($id);

        if (!$object) {
            throw new NotFoundHttpException(sprintf('unable to find the object with id : %s', $id));
        }

        if (false === $this->admin->isGranted('EDIT', $object)) {
            throw new AccessDeniedException();
        }

        $preResponse = $this->preEdit($request, $object);
        if ($preResponse !== null) {
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
            if ($isFormValid && (!$this->isInPreviewMode($request) || $this->isPreviewApproved($request))) {
                try {
                    $object = $this->admin->update($object);

                    if ($this->isXmlHttpRequest($request)) {
                        return $this->renderJson(
                            array(
                                'result' => 'ok',
                                'objectId' => $this->admin->getNormalizedIdentifier($object),
                                'objectName' => $this->escapeHtml($this->admin->toString($object)),
                            ),
                            200,
                            array(),
                            $request
                        );
                    }

                    $this->addFlash(
                        'sonata_flash_success',
                        $this->admin->trans(
                            'flash_edit_success',
                            array('%name%' => $this->escapeHtml($this->admin->toString($object))),
                            'SonataAdminBundle'
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
                            array(
                                '%name%' => $this->escapeHtml($this->admin->toString($object)),
                                '%link_start%' => '<a href="' . $this->admin->generateObjectUrl('edit', $object) . '">',
                                '%link_end%' => '</a>',
                            ),
                            'SonataAdminBundle'
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
                            array('%name%' => $this->escapeHtml($this->admin->toString($object))),
                            'SonataAdminBundle'
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
        $this->get('twig')->getExtension('form')->renderer->setTheme($view, $this->admin->getFormTheme());

        return $this->render(
            $this->admin->getTemplate($templateKey),
            array(
                'action' => 'edit',
                'form' => $view,
                'object' => $object,
                'consultationTypes' => $this->getConsultationTypes(),
            ),
            null,
            $request
        );
    }

    public function showAction($id = null, Request $request = null)
    {
        $id = $request->get($this->admin->getIdParameter());

        $object = $this->admin->getObject($id);

        if (!$object) {
            throw new NotFoundHttpException(sprintf('unable to find the object with id : %s', $id));
        }

        if (false === $this->admin->isGranted('VIEW', $object)) {
            throw new AccessDeniedException();
        }

        $preResponse = $this->preShow($request, $object);
        if ($preResponse !== null) {
            return $preResponse;
        }

        $this->admin->setSubject($object);

        return $this->render(
            $this->admin->getTemplate('show'),
            array(
                'action' => 'show',
                'object' => $object,
                'elements' => $this->admin->getShow(),
                'consultationTypes' => $this->getConsultationTypes(),
            ),
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

        if (false === $this->admin->isGranted('DELETE', $object)) {
            throw new AccessDeniedException();
        }

        $preResponse = $this->preDelete($request, $object);
        if ($preResponse !== null) {
            return $preResponse;
        }

        if ($this->getRestMethod($request) === 'DELETE') {
            // check the csrf token
            $this->validateCsrfToken('sonata.delete', $request);

            $objectName = $this->admin->toString($object);

            try {
                $this->admin->delete($object);

                if ($this->isXmlHttpRequest($request)) {
                    return $this->renderJson(array('result' => 'ok'), 200, array(), $request);
                }

                $this->addFlash(
                    'sonata_flash_success',
                    $this->admin->trans(
                        'flash_delete_success',
                        array('%name%' => $this->escapeHtml($objectName)),
                        'SonataAdminBundle'
                    )
                );
            } catch (ModelManagerException $e) {
                $this->handleModelManagerException($e);

                if ($this->isXmlHttpRequest($request)) {
                    return $this->renderJson(array('result' => 'error'), 200, array(), $request);
                }

                $this->addFlash(
                    'sonata_flash_error',
                    $this->admin->trans(
                        'flash_delete_error',
                        array('%name%' => $this->escapeHtml($objectName)),
                        'SonataAdminBundle'
                    )
                );
            }

            return $this->redirectTo($object, $request);
        }

        return $this->render(
            $this->admin->getTemplate('delete'),
            array(
                'object' => $object,
                'action' => 'delete',
                'csrf_token' => $this->getCsrfToken('sonata.delete'),
                'consultationTypes' => $this->getConsultationTypes(),
            ),
            null,
            $request
        );
    }

    public function getConsultationTypes()
    {
        $opinionTypes = $this->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:OpinionType')
            ->createQueryBuilder('ot')
            ->leftJoin('ot.consultationType', 'ct')
            ->where('ot.consultationType IS NOT NULL')
            ->andWhere('ot.parent IS NULL')
            ->orderBy('ct.id', 'asc')
            ->getQuery()
            ->getResult()
        ;

        $otRepo = $this->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:OpinionType')
        ;

        $consultationTypes = [];

        foreach ($opinionTypes as $root) {
            $ct = $root->getConsultationType()->getTitle();
            $consultationTypes[$ct][] = $otRepo
                ->childrenHierarchy($root, false, [
                    'decorate' => true,
                    'rootOpen' => '',
                    'rootClose' => '',
                    'nodeDecorator' => function ($node) {
                        $url = $this->admin->generateUrl('create', ['opinion_type' => $node['id']]);
                        $levelIndicator = ' ';
                        for ($i = 0; $i < $node['level']; $i++) {
                            $levelIndicator = '-' . $levelIndicator;
                        }
                        return
                            '<a href="'.$url.'">'
                                .'<i class="fa fa-plus-circle"></i>'
                                .$levelIndicator.$node['title']
                            .'</a>'
                        ;
                    },
                    'childSort' => ['field' => 'position', 'dir' => 'asc'],
                ], true)
            ;
        }

        return $consultationTypes;
    }

    public function updateAppendicesForOpinion(Opinion $opinion)
    {
        $appendixTypes = $this->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:OpinionTypeAppendixType')
            ->findBy(
                ['opinionType' => $opinion->getOpinionType()],
                ['position' => 'ASC']
        );
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
