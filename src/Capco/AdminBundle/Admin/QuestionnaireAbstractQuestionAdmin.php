<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class QuestionnaireAbstractQuestionAdmin extends Admin
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
        $questionnaireId = null;

        if ($this->hasParentFieldDescription()) { // this Admin is embedded
            $questionnaire = $this->getParentFieldDescription()->getAdmin()->getSubject();
            if ($questionnaire) {
                $questionnaireId = $questionnaire->getId();
            }
        }

        $formMapper
            ->add('position', null, [
                'label' => 'admin.fields.questionnaire_abstractquestion.position',
            ])
            ->add('question', 'sonata_type_model_list', [
                'required' => true,
                'label' => 'admin.fields.questionnaire_abstractquestion.questions',
                'translation_domain' => 'SonataAdminBundle',
                'btn_delete' => false,
                'btn_add' => 'admin.fields.questionnaire_abstractquestion.questions_add',
            ], [
                'link_parameters' => ['questionnaireId' => $questionnaireId],
            ])
        ;
    }

    public function postRemove($object)
    {
        // delete linked question
        if ($object->getQuestion()) {
            $em = $this->getConfigurationPool()->getContainer()->get('doctrine.orm.entity_manager');
            $em->remove($object->getQuestion());
        }
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['create', 'delete', 'edit']);
    }
}
