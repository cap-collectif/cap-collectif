import React, {FC} from 'react'
import {Box, Flex, Text} from "@cap-collectif/ui";
import HelpMessage from "@ui/HelpMessage/HelpMessage";
import {useIntl} from "react-intl";

type Props = {
    showHelpMessage: boolean
}
const CreateProjectHelpMessage: FC<Props> = ({ showHelpMessage }) => {
    const intl = useIntl();

    if (!showHelpMessage) return null;

    return (
        <Flex mb={10} width="50%" justifyContent="center">
            <Box maxWidth="486px">
                <HelpMessage variant="info">
                    <Box>
                        <Text>{intl.formatMessage({id: "choose-a-short-and-precise-title-that-allow-to-identify-your-project"})}</Text>
                        <Text>{intl.formatMessage({id: "this-is-an-example-of-projects-that-succeeded"})}</Text>
                        <Box my={4}>
                            <Text>✅ La fabrique à projets citoyens d'Herbignac</Text>
                            <Text>✅ Le Savès en 2030, quel futur voulons nous ?</Text>
                        </Box>
                        <Text mb={4}>❌ Petites Villes de Demain : "Donnez votre avis sur votre ville"</Text>
                    </Box>
                </HelpMessage>
            </Box>
        </Flex>
    )
}

export default CreateProjectHelpMessage