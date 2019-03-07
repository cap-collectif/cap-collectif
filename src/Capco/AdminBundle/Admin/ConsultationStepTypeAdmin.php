<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Repository\OpinionTypeRepository;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Form\Type\ModelType;
use Sonata\AdminBundle\Show\ShowMapper;

class ConsultationStepTypeAdmin extends AbstractAdmin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    public function getTemplate($name)
    {
        if ('edit' === $name) {
            return 'CapcoAdminBundle:ConsultationStepType:edit.html.twig';
        }

        return $this->getTemplateRegistry()->getTemplate($name);
    }

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, [
                'label' => 'admin.fields.consultation_step_type.title',
            ])
            ->add('opinionTypes', null, [
                'label' => 'admin.fields.consultation_step_type.opinion_types',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.consultation_step_type.updated_at',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.consultation_step_type.created_at',
            ]);
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, [
                'label' => 'admin.fields.consultation_step_type.title',
            ])
            ->add('step', null, [
                'label' => 'admin.fields.consultation_step_type.step',
            ])
            ->add('opinionTypes', 'sonata_type_model', [
                'label' => 'admin.fields.consultation_step_type.opinion_types',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.consultation_step_type.updated_at',
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'show' => [],
                    'edit' => [],
                    'delete' => [],
                ],
            ]);
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper->add('title', null, [
            'label' => 'admin.fields.consultation_step_type.title',
        ]);
        if ($this->getSubject()->getId()) {
            $formMapper->add('opinionTypes', ModelType::class, [
                'label' => 'admin.fields.consultation_step_type.opinion_types',
                'query' => $this->createQueryForOpinionTypes(),
                'by_reference' => false,
                'multiple' => true,
                'expanded' => true,
                'required' => true,
                'tree' => true,
                'choices_as_values' => true,
                'disabled' => true,
            ]);
        }
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, [
                'label' => 'admin.fields.consultation_step_type.title',
            ])
            ->add('opinionTypes', null, [
                'label' => 'admin.fields.consultation_step_type.opinion_types',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.consultation_step_type.updated_at',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.consultation_step_type.created_at',
            ]);
    }

    private function createQueryForOpinionTypes()
    {
        $subject = $this->getSubject()->getId() ? $this->getSubject() : null;

        return $this->getConfigurationPool()
            ->getContainer()
            ->get(OpinionTypeRepository::class)
            ->getOrderedRootNodesQuery($subject);
    }
}
