<?php

namespace Capco\AdminBundle\Admin;

use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Validator\Constraints\Valid;

class QuestionnaireAdmin extends AbstractAdmin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
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

    public function preUpdate($object)
    {
        // We must make sure a question position by questionnaire is unique
        $questionRepo = $this->getConfigurationPool()->getContainer()->get('capco.questionnaire_abstract_question.repository');
        $delta = $questionRepo->getCurrentMaxPositionForQuestionnaire($object->getId());

        foreach ($object->getQuestions() as $question) {
            $question->setPosition($question->getPosition() + $delta);
        }
    }

    // Fields to be shown on create/edit forms
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->with('admin.fields.questionnaire.group_general')
                ->add('title', null, [
                    'label' => 'admin.fields.questionnaire.title',
                ])
                ->add('description', CKEditorType::class, [
                    'label' => 'admin.fields.questionnaire.description',
                    'config_name' => 'admin_editor',
                    'required' => false,
                ])
            ->end()
        ;

        $formMapper
            ->with('admin.fields.questionnaire.group_questions')
                ->add('questions', 'sonata_type_collection', [
                    'label' => 'admin.fields.questionnaire.questions',
                    'by_reference' => false,
                    'required' => false,
                ], [
                    'edit' => 'inline',
                    'inline' => 'table',
                    'sortable' => 'position',
                ])
            ->end()
        ;

        $formMapper
            ->with('user.profile.notifications.title')
            ->add('acknowledgeReplies', CheckboxType::class, [
                'label' => 'admin.fields.questionnaire.acknowledge_replies',
                'required' => false,
            ])
            ->end()
            ->with('proposal_form.admin.settings.options')
                ->add('anonymousAllowed', CheckboxType::class, [
                    'label' => 'reply-anonymously',
                    'required' => false,
                ])
            ->add('multipleRepliesAllowed', CheckboxType::class, [
                'label' => 'answer-several-times',
                'required' => false,
            ])
            ->end()
            ->with('requirements')
            ->add('phoneConfirmation', CheckboxType::class, [
                'label' => 'phone-number-verified-by-sms',
                'required' => false,
            ])
        ;
    }

    // Fields to be shown on filter forms
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, [
                'label' => 'admin.fields.questionnaire.title',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.questionnaire.updated_at',
            ])
        ;
    }

    // Fields to be shown on lists
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, [
                'label' => 'admin.fields.questionnaire.title',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.questionnaire.updated_at',
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'show' => [],
                    'edit' => [],
                    'delete' => [],
                ],
            ])
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, [
                'label' => 'admin.fields.questionnaire.title',
            ])
            ->add('enabled', null, [
                'label' => 'admin.fields.questionnaire.enabled',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.questionnaire.updated_at',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.questionnaire.updated_at',
            ])
        ;
    }
}
