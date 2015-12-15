<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class ProjectAbstractStepAdmin extends Admin
{
    protected $formOptions = [
        'cascade_validation' => true,
    ];

    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'position',
    ];

    protected $translationDomain = 'SonataAdminBundle';

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $projectId = null;

        if ($this->hasParentFieldDescription()) { // this Admin is embedded
            $project = $this->getParentFieldDescription()->getAdmin()->getSubject();
            if ($project) {
                $projectId = $project->getId();
            }
        }

        $formMapper
            ->add('position', null, [
                'label' => 'admin.fields.project_abstractstep.position',
            ])
            ->add('step', 'sonata_type_model_list', [
                'required' => true,
                'label' => 'admin.fields.project_abstractstep.steps',
                'translation_domain' => 'SonataAdminBundle',
                'btn_delete' => false,
                'btn_add' => 'admin.fields.project_abstractstep.steps_add',
            ], [
               'link_parameters' => ['projectId' => $projectId],
            ])
        ;
    }

    public function postRemove($object)
    {
        // delete linked step
        if ($object->getStep()) {
            $em = $this->getConfigurationPool()->getContainer()->get('doctrine.orm.entity_manager');
            $em->remove($object->getStep());
        }
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['create', 'delete', 'edit']);
    }
}
