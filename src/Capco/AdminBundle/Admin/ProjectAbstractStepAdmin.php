<?php

namespace Capco\AdminBundle\Admin;

use Doctrine\ORM\EntityManagerInterface;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Form\Type\ModelListType;
use Sonata\AdminBundle\Route\RouteCollectionInterface;

class ProjectAbstractStepAdmin extends CapcoAdmin
{
    protected array $formOptions = [
        'cascade_validation' => true,
    ];

    protected array $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'position',
    ];

    private readonly EntityManagerInterface $entityManager;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        EntityManagerInterface $entityManager
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->entityManager = $entityManager;
    }

    public function postRemove($object): void
    {
        // delete linked step
        if ($object->getStep()) {
            $this->entityManager->remove($object->getStep());
        }
    }

    protected function configureFormFields(FormMapper $form): void
    {
        $projectId = null;

        if ($this->hasParentFieldDescription()) {
            // this Admin is embedded
            $project = $this->getParentFieldDescription()
                ->getAdmin()
                ->getSubject()
            ;
            if ($project) {
                $projectId = $project->getId();
            }
        }

        $form
            ->add('position', null, [
                'label' => 'global.position',
            ])
            ->add(
                'step',
                ModelListType::class,
                [
                    'required' => true,
                    'label' => 'project.show.meta.step.title',
                    'translation_domain' => 'CapcoAppBundle',
                    'btn_delete' => false,
                    'btn_add' => 'admin.fields.project_abstractstep.steps_add',
                ],
                [
                    'link_parameters' => ['projectId' => $projectId],
                ]
            )
        ;
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(['create', 'delete', 'edit', 'show']);
    }
}
