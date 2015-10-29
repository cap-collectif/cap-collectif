<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Question;
use Capco\AppBundle\Entity\QuestionType;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class QuestionAdmin extends Admin
{
    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'createdAt',
    );

    protected $formOptions = array(
        'cascade_validation' => true
    );

    // Fields to be shown on create/edit forms
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('position', 'integer', [
                'label' => 'admin.fields.question.position',
            ])
            ->add('title', null, [
                'label'    => 'admin.fields.question.title',
                'required' => true,
            ])
            ->add('helpText', null, [
                'label'    => 'admin.fields.question.help_text',
                'required' => true,
            ])
            ->add('questionType', 'choice', array(
                'label'              => 'admin.fields.question.question_type',
                'choices'            => Question::$questionTypes,
                'translation_domain' => 'CapcoAppBundle',
                'required'           => true,
            ))
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
