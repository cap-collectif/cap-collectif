<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class QuestionnaireAbstractQuestionAdmin extends CapcoAdmin
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
        // delete linked question
        if ($object->getQuestion()) {
            $em = $this->getConfigurationPool()->getContainer()->get('doctrine')->getManager();
            $em->remove($object->getQuestion());
        }
    }

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
                'required' => true,
            ])
            ->add('question', 'sonata_type_model_list', [
                'required' => true,
                'label' => 'admin.fields.questionnaire_abstractquestion.questions',
                'translation_domain' => 'CapcoAppBundle',
                'btn_delete' => false,
                'btn_add' => 'admin.fields.questionnaire_abstractquestion.questions_add',
            ], [
                'link_parameters' => ['questionnaireId' => $questionnaireId],
            ])
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['create', 'delete', 'edit']);
    }
}
