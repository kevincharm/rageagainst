#![deny(clippy::all)]

use napi::bindgen_prelude::*;
use nixpacks::{
    create_docker_image,
    nixpacks::{builder::docker::DockerBuilderOptions, plan::generator::GeneratePlanOptions},
};

#[macro_use]
extern crate napi_derive;

#[napi]
pub async fn build_image(image_name: String, path: String) -> Result<String> {
    let config_file_path = format!("{}/nixpacks.toml", path);
    match create_docker_image(
        &path,
        vec!["YARN_ENABLE_IMMUTABLE_INSTALLS=false"], // hack
        &GeneratePlanOptions {
            config_file: Some(config_file_path),
            ..Default::default()
        },
        &DockerBuilderOptions {
            name: Some(image_name.clone()),
            quiet: false,
            ..Default::default()
        },
    )
    .await
    {
        Ok(_) => {}
        Err(e) => {
            return Err(Error::new(
                Status::GenericFailure,
                format!("Failed to build image from {}:\n{:?}", path, e),
            ))
        }
    }

    Ok(image_name)
}

use napi::tokio;
#[tokio::test]
async fn test_build_image() {
    let name = "test_build_image_name".to_string();
    let path = "/tmp/b40c219f-8015-482d-88e3-77f1ae88dca7/uniswap-interface".to_string();
    build_image(name, path).await.unwrap();
}
