<?php

namespace Capco\AdminBundle\Controller;

use Capco\AdminBundle\Controller\CRUDController as Controller;
use Sonata\AdminBundle\Exception\ModelManagerException;
use Symfony\Component\Form\FormError;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormRenderer;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class PageController extends Controller
{
    public function createAction(Request $request): Response
    {
        $this->admin->checkAccess('create');

        $newPage = $this->admin->getNewInstance();

        $this->admin->setSubject($newPage);

        $form = $this->admin->getForm();

        $form->setData($newPage);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            self::checkBody($form);
            $isFormValid = $form->isValid();

            if ($isFormValid) {
                $submittedPage = $form->getData();
                $this->admin->setSubject($submittedPage);
                $this->admin->checkAccess('create', $submittedPage);

                try {
                    $newPage = $this->admin->create($submittedPage);

                    $this->addFlash(
                        'sonata_flash_success',
                        $this->trans(
                            'success.creation.flash',
                            ['name' => $this->escapeHtml($this->admin->toString($newPage))],
                            'SonataAdminBundle'
                        )
                    );

                    // redirect to edit mode
                    return $this->redirectTo($request, $newPage);
                } catch (ModelManagerException $e) {
                    $this->handleModelManagerException($e);

                    $isFormValid = false;
                }
            }

            // show an error message if the form failed validation
            if (!$isFormValid) {
                $this->addFlash(
                    'sonata_flash_error',
                    $this->trans(
                        'error.creation.flash',
                        ['name' => $this->escapeHtml($this->admin->toString($newPage))],
                        'SonataAdminBundle'
                    )
                );
            }
        }

        $formView = $form->createView();

        // set the theme for the current Admin Form
        $this->get('twig')
            ->getRuntime(FormRenderer::class)
            ->setTheme($formView, $this->admin->getFormTheme())
        ;

        $template = $this->admin->getTemplateRegistry()->getTemplate('edit');

        return $this->renderWithExtraParams(
            $template,
            [
                'action' => 'create',
                'form' => $formView,
                'object' => $newPage,
                'objectId' => null,
            ],
            null
        );
    }

    private function checkBody(FormInterface $form): void
    {
        foreach ($form->getData()->getNewTranslations() as $translation) {
            if (null === $translation->getBody()) {
                $form->addError(
                    new FormError($this->trans('error.page.body.none', [], 'SonataAdminBundle'))
                );
            }
        }
    }
}
