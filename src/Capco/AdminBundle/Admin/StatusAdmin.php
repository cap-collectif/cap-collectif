<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Status;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Symfony\Component\Validator\Constraints\Valid;

class StatusAdmin extends CapcoAdmin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'position',
    ];

    protected $formOptions = [
        'cascade_validation' => true,
    ];

    public function getFormBuilder()
    {
        if (isset($this->formOptions['cascade_validation'])) {
            unset($this->formOptions['cascade_validation']);
            $this->formOptions['constraints'][] = new Valid();
        }

        return parent::getFormBuilder();
    }

    // Fields to be shown on create/edit forms
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('position', null, [
                'label' => 'admin.fields.status.position',
            ])
            ->add('name', null, [
                'label' => 'admin.fields.status.name',
                'required' => true,
            ])
            ->add('color', 'choice', [
                'choices' => Status::$statusesLabels,
                'label' => 'admin.fields.status.color',
                'required' => true,
                'translation_domain' => 'CapcoAppBundle',
            ])
        ;
    }

    // Fields to be shown on show page

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
    }

    // Fields to be shown on filter forms

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
    }

    // Fields to be shown on lists

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
    }
}
