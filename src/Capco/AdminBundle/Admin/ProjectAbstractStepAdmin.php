<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class ProjectAbstractStepAdmin extends CapcoAdmin
{
    protected $formOptions = [
        'cascade_validation' => true,
    ];

    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'position',
    ];

    public function postRemove($object)
    {
        // delete linked step
        if ($object->getStep()) {
            $em = $this->getConfigurationPool()
                ->getContainer()
                ->get('doctrine')
                ->getManager();
            $em->remove($object->getStep());
        }
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $projectId = null;

        if ($this->hasParentFieldDescription()) {
            // this Admin is embedded
            $project = $this->getParentFieldDescription()
                ->getAdmin()
                ->getSubject();
            if ($project) {
                $projectId = $project->getId();
            }
        }

        $formMapper
            ->add('position', null, [
                'label' => 'global.position',
            ])
            ->add(
                'step',
                'sonata_type_model_list',
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
            );
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['create', 'delete', 'edit', 'show']);
    }
}
